from rest_framework import serializers
from .models import IncomeStatus
from .models import RetirementInfo

class IncomeStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeStatus
        fields = '__all__'

class RetirementInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetirementInfo
        fields = '__all__'   # includes user