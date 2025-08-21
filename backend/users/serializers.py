from rest_framework import serializers
from .models import IncomeStatus
from .models import RetirementInfo
from .models import UserData
from django.contrib.auth.models import User
from .models import LifeExpectancy

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the Django User model"""
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserDataSerializer(serializers.ModelSerializer):
    """Serializer for user personal details"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserData
        fields = [
            "id",
            "user",
            "name",
            "dateOfBirth",
            "gender",
            "location",
            "maritalStatus",
            "numberOfDependants",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "user", "createdAt", "updatedAt"]


class IncomeStatusSerializer(serializers.ModelSerializer):
    """Serializer for Income Status model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = IncomeStatus
        fields = [
            "id",
            "user",
            "currentSalary",
            "yearsOfService",
            "employerType",
            "pensionScheme",
            "pensionBalance",
            "employerContribution",
            "yourContribution",
        ]


class RetirementInfoSerializer(serializers.ModelSerializer):
    """Serializer for Retirement Info model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = RetirementInfo
        fields = "__all__"

class LifeExpectancySerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeExpectancy
        fields = [
            'Height', 'Weight', 'Gender', 'BMI', 'Physical_Activity',
            'Smoking_Status', 'Alcohol_Consumption', 'Diet', 'Blood_Pressure',
            'Cholesterol', 'Asthma', 'Diabetes', 'Heart_Disease', 'Hypertension',
            'predicted_life_expectancy', 'is_skipped', 'created_at'
        ]
        read_only_fields = ['created_at']