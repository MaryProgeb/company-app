from django.core.validators import (
    MinLengthValidator,
    MaxLengthValidator,
    MinValueValidator,
    MaxValueValidator,
)
from django.db import models
from django.utils.translation import gettext_lazy as _


class Company(models.Model):
    name = models.CharField(
        unique=True,
        validators=[MinLengthValidator(3), MaxLengthValidator(100)]
        )
    code = models.PositiveIntegerField(
        unique=True,
        validators=[MinValueValidator(10000000), MaxValueValidator(99999999)]
        )
    date_established = models.DateField()
    capital = models.PositiveBigIntegerField(
        validators=[MinValueValidator(2500)],
        default=2500
    )

    def __str__(self):
        return f"{self.name}, {self.code}, {self.date_established}, {self.capital}"


class Person(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(
        unique=True,
        validators=[MinLengthValidator(11), MaxLengthValidator(11)]
    )

    def __str__(self):
        return f"{self.name}, {self.code}"


class Shareholder(models.Model): # TODO add is_founder
    class ShareholderType(models.TextChoices):
        PERSON = "PERSON", _("Person")
        COMPANY = "COMPANY", _("Company")

    type = models.CharField(
        max_length=7,
        choices=ShareholderType.choices,
        default=ShareholderType.PERSON,
    )
    person = models.ForeignKey(Person, on_delete=models.PROTECT, related_name="+", null=True)
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name="+", null=True)
    target_company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="shareholders")
    target_company_share = models.PositiveBigIntegerField(
        validators=[MinValueValidator(1)]
    )
    is_founder = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.person}, {self.company}, {self.target_company}"
