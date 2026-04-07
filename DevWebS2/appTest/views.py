from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

def page_accueil(request):
    return HttpResponse("Hello World !")