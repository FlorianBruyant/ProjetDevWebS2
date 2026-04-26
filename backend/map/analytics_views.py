from datetime import timedelta

from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncDay, TruncHour
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.permissions import IsAdminOrComplexe

from .models import AlerteObjet, HistoriqueObjet
from .services.detection_anomalies import (
    TYPE_MODEL_MAP,
    recuperer_objet,
    verifier_consommation_et_declencher_alerte,
)


def _appliquer_filtre_zone(queryset, zone_id, type_objet=None):
    q_zone = Q(pk__in=[])
    types_cibles = TYPE_MODEL_MAP.keys() if not type_objet else [type_objet]

    for cle_type in types_cibles:
        model = TYPE_MODEL_MAP.get(cle_type)
        if model is None:
            continue

        ids = list(model.objects.filter(zone_id=zone_id).values_list("id", flat=True))
        if ids:
            q_zone |= Q(type_objet=cle_type, objet_id__in=ids)

    return queryset.filter(q_zone) if q_zone.children else queryset.none()


@api_view(["GET"])
@permission_classes([IsAdminOrComplexe])
def get_analytics(request):
    period_hours = request.query_params.get("period_hours", "24")
    type_objet = request.query_params.get("type_objet", "").strip().lower()
    zone_id = request.query_params.get("zone", "").strip()

    try:
        period_hours = max(1, min(int(period_hours), 24 * 30))
    except ValueError:
        return Response({"error": "Le parametre period_hours doit etre numerique."}, status=400)

    if type_objet and type_objet not in TYPE_MODEL_MAP:
        return Response({"error": "Type d'objet non supporte."}, status=400)

    date_limite = timezone.now() - timedelta(hours=period_hours)
    stats_recentes = HistoriqueObjet.objects.filter(date_mesure__gte=date_limite)

    if type_objet:
        stats_recentes = stats_recentes.filter(type_objet=type_objet)

    if zone_id:
        stats_recentes = _appliquer_filtre_zone(stats_recentes, zone_id, type_objet or None)

    resume = stats_recentes.aggregate(
        consommation_totale=Sum("consommation_kwh"),
        consommation_moyenne=Avg("consommation_kwh"),
        mesures=Count("id"),
    )

    par_type = list(
        stats_recentes.values("type_objet")
        .annotate(
            total=Sum("consommation_kwh"),
            moyenne=Avg("consommation_kwh"),
            mesures=Count("id"),
        )
        .order_by("type_objet")
    )

    fonction_bucket = TruncHour("date_mesure") if period_hours <= 72 else TruncDay("date_mesure")
    graphique = list(
        stats_recentes.annotate(bucket=fonction_bucket)
        .values("bucket")
        .annotate(conso=Sum("consommation_kwh"))
        .order_by("bucket")
    )
    for point in graphique:
        bucket = point.pop("bucket")
        point["periode"] = (
            bucket.strftime("%d/%m %Hh") if period_hours <= 72 else bucket.strftime("%d/%m")
        )

    alertes = AlerteObjet.objects.filter(declenchee_le__gte=date_limite)
    if type_objet:
        alertes = alertes.filter(type_objet=type_objet)
    if zone_id:
        alertes = alertes.filter(zone_id=zone_id)

    alertes_data = list(
        alertes.select_related("zone")
        .values(
            "id",
            "type_objet",
            "objet_id",
            "niveau",
            "message",
            "statut",
            "declenchee_le",
            "zone__nom",
        )
        .order_by("-declenchee_le")[:20]
    )

    return Response(
        {
            "filters": {
                "period_hours": period_hours,
                "type_objet": type_objet or "all",
                "zone": zone_id or "all",
            },
            "resume": {
                "consommation_totale": float(resume["consommation_totale"] or 0.0),
                "consommation_moyenne": float(resume["consommation_moyenne"] or 0.0),
                "mesures": int(resume["mesures"] or 0),
                "alertes_actives": alertes.filter(statut="active").count(),
            },
            "par_type": par_type,
            "graphique": graphique,
            "alertes": alertes_data,
        }
    )


@api_view(["POST"])
@permission_classes([IsAdminOrComplexe])
def verifier_anomalie_consommation(request, type_objet, objet_id):
    type_objet = type_objet.strip().lower()
    if type_objet not in TYPE_MODEL_MAP:
        return Response({"error": "Type d'objet non supporte."}, status=400)

    objet = recuperer_objet(type_objet, objet_id)
    if objet is None:
        return Response({"error": "Objet introuvable."}, status=404)

    consommation_actuelle = request.data.get("consommation_actuelle")
    if consommation_actuelle not in [None, ""]:
        try:
            consommation_actuelle = float(consommation_actuelle)
        except (TypeError, ValueError):
            return Response(
                {"error": "La consommation_actuelle doit etre numerique."},
                status=400,
            )

    resultat = verifier_consommation_et_declencher_alerte(
        objet,
        consommation_actuelle=consommation_actuelle,
    )

    return Response(
        {
            "objet": {
                "id": objet.id,
                "nom": objet.nom,
                "type_objet": type_objet,
                "zone": getattr(getattr(objet, "zone", None), "nom", None),
            },
            "analyse": resultat.to_dict(),
        }
    )
