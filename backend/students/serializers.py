from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from .models import (
    Student,
    StudentUploadedCertificate,
    StudentSkill,
    Teacher,
    Assessment,
)


# ===========================
# STUDENT UPLOADED CERTIFICATE
# ===========================
class StudentUploadedCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentUploadedCertificate
        fields = ["id", "file", "uploaded_at"]


# ===========================
# STUDENT SKILL
# ===========================
class StudentSkillSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = StudentSkill
        fields = ["student_skill_id", "student", "username", "offer", "want", "level", "status"]
        extra_kwargs = {
            "student": {"read_only": True},
        }


# ===========================
# STUDENT
# ===========================
class StudentSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=False)
    uploaded_certificates = StudentUploadedCertificateSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            "student_id",
            "username",
            "email",
            "phone_number",
            "department",
            "year",
            "about_me",
            "skills",
            "picture",
            "password",
            "confirm_password",
            "uploaded_certificates",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
        }

    # ✅ VALIDATE ONLY IF PASSWORD PROVIDED AND NOT EMPTY
    def validate(self, data):
        password = data.get("password", None)
        confirm = data.get("confirm_password", None)

        # ✅ If password is empty string, ignore it
        if password == "" or password is None:
            data.pop("password", None)
            data.pop("confirm_password", None)
            return data

        # ✅ If user wants to change password
        if not confirm:
            raise serializers.ValidationError({"confirm_password": "Confirm password is required"})

        if password != confirm:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        # ✅ Password Complexity Check
        import re
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$', password):
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long and include at least one letter and one number."})

        return data

    # ✅ CREATE (SIGNUP)
    def create(self, validated_data):
        validated_data.pop("confirm_password", None)

        if "password" in validated_data and validated_data["password"]:
            validated_data["password"] = make_password(validated_data["password"])

        return super().create(validated_data)

    # ✅ UPDATE (PROFILE EDIT)
    def update(self, instance, validated_data):
        validated_data.pop("confirm_password", None)

        # ✅ If password is provided, hash it
        password = validated_data.pop("password", None)
        if password:
            instance.password = make_password(password)

        # ✅ Update remaining fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


# ===========================
# ✅ TEACHER SERIALIZER (NEW)
# ===========================
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ["teacher_id", "name", "email", "department", "profile", "status"]


# ===========================
# ✅ ASSESSMENT SERIALIZER (NEW)
# ===========================
class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = [
            "assessment_id",
            "study",
            "student",
            "project_title",
            "assessment_work",
            "assessment_file",
            "validation_form_file",
            "submitted_at",
            "status",
        ]
        extra_kwargs = {
            "study": {"read_only": True},
            "student": {"read_only": True},
            "assessment_file": {"required": False},
            "validation_form_file": {"required": False},
        }
