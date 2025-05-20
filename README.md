"# appsistencia"  
quiza entrar a la carpeta /api o /backend

-pip install virtualenv

-python -m virtualenv venv

-.\venv\Scripts\activate

-F1 seleccionar interprete

-pip install django

-pip install djangorestframework

-django-admin startproject prueba .

-python manage.py startapp projects

-Ir a settings y agregar en installed app 'rest_framework', projects o como llames a la app

-python manage.py inspectdb > api/models.py o ELIMINAR la db.sqlite3 y hacer migrate

-Dentro de la carpeta projects crear serializers.py

-------------------------------------------------------------------------------------------
-SERIALIZERS
from rest_framework import serializers
from .models import Post, Comentario ------ aqui van todos los modelos que deseo importar


class PostListarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'titulo', 'autor', 'fecha']

class PostCrearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['titulo', 'contenido', 'autor_id']

class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = ['id', 'texto', 'autor']
-------------------------------------------------------------------------------------------

-Dentro de projects crear api.py

-------------------------------------------------------------------------------------------
-API VIEW

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Post, Comentario
from .serializers import PostListarSerializer, PostCrearSerializer, ComentarioSerializer

@api_view(['GET'])
def obtener_posts(request):
    posts = Post.objects.all()
    serializer = PostListarSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def crear_post(request):
    serializer = PostCrearSerializer(data=request.data)
    if serializer.is_valid():
        post = serializer.save()
        return Response({
            'id': post.id,
            'titulo': post.titulo
        })
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def obtener_comentarios(request, id):
    comentarios = Comentario.objects.filter(post_id=id)
    serializer = ComentarioSerializer(comentarios, many=True)
    return Response(serializer.data)
-------------------------------------------------------------------------------------------

-Crear en la carpeta projects urls.py

from django.urls import path
from . import api  # 👈 importa tu archivo api.py

urlpatterns = [
    path('posts', api.obtener_posts),  # GET
    path('posts/<int:id>/comentarios', api.obtener_comentarios),  # GET
    path('posts', api.crear_post),  # POST
]

--------------------------------------------------------------------------------------------

-En urls de la primera carpeta agregar from include
    path('', include('api.urls')),


