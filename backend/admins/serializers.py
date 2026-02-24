from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Admin
import re

class AdminSignupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Admin
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if Admin.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_password(self, value):
        # Password rules
        pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Password must contain uppercase, number & special character"
            )
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
