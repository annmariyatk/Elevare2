from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Admin
from students.models import Teacher

@api_view(['POST'])
def check_unique_admin(request):
    email = request.data.get('email')
    if email and Admin.objects.filter(email=email).exists():
        return Response({"email": "Email already exists."}, status=400)
    return Response({"message": "Unique"})

@api_view(['POST'])
def check_unique_teacher(request):
    email = request.data.get('email')
    phone = request.data.get('phone_number')
    errors = {}

    if email and Teacher.objects.filter(email=email).exists():
        errors["email"] = "Email already exists."

    if phone and Teacher.objects.filter(phone_number=phone).exists():
        errors["phone_number"] = "Phone number already exists."

    if errors:
        return Response(errors, status=400)
    return Response({"message": "Unique"})
