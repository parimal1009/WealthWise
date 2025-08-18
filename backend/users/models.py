from django.db import models
from django.contrib.auth.models import User

class IncomeStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="income_status")
    currentSalary = models.DecimalField(max_digits=12, decimal_places=2)
    yearsOfService = models.IntegerField()
    employerType = models.CharField(max_length=100)
    pensionScheme = models.CharField(max_length=100)
    pensionBalance = models.DecimalField(max_digits=15, decimal_places=2)
    employerContribution = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.employerType} - {self.currentSalary}"


class RetirementInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="retirement_info")
    plannedRetirementAge = models.IntegerField()
    retirementLifestyle = models.CharField(max_length=50)  # minimalistic, comfortable, lavish
    monthlyRetirementExpense = models.DecimalField(max_digits=12, decimal_places=2)
    legacyGoal = models.CharField(max_length=50)  # maximize-income, moderate-legacy, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Retirement Plan for {self.user.username} - Age {self.plannedRetirementAge}"