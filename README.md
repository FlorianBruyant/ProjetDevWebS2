# ProjetDevWebS2

## Prérequis
- Python 3.11+
- Node.js 18+

## Installation

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # puis remplir les valeurs
python manage.py migrate
```

### Frontend
```bash
cd frontend
npm install
```

### Remplir le fichier `.env`
Générer une SECRET_KEY avec la commande suivante :
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Puis coller la valeur dans `backend/.env` :
```
SECRET_KEY=la-valeur-générée-ici
DEBUG=True
```

## Pour lancer le projet (depuis la racine)

### Lancer d'abord le Backend (terminal 1)
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Lancer le frontend (terminal 2)
```bash
cd frontend
npm run dev
```

## Accès
- React : http://localhost:5173
- Django API : http://localhost:8000