from datetime import date
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import Company, Person, Shareholder


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = [
            "id",
            "name",
            "code",
        ]


class ShareholderSerializer(serializers.ModelSerializer):
    company__code = serializers.CharField(source='company.code',required=False)
    company__name = serializers.CharField(source='company.name', required=False)
    person__code = serializers.CharField(source='person.code', required=False)
    person__name = serializers.CharField(source='person.name', required=False)

    class Meta:
        model = Shareholder
        fields = [
            "type",
            "person",
            "person__name",
            "person__code",
            "company",
            "company__name",
            "company__code",
            "target_company_share",
            "is_founder",
        ]

        extra_kwargs = {
            'is_founder': {'read_only': True},
        }

    def validate(self, attrs):
        if (attrs["type"] == "PERSON") and ("person" not in attrs or not attrs["person"]):
            raise serializers.ValidationError(
                _("Person ID is a required field if the shareholder type is PERSON.")
                )
        elif (attrs["type"] == "COMPANY") and ("company" not in attrs or not attrs["company"]):
            raise serializers.ValidationError(
                _("Company ID is a required field if the shareholder type is COMPANY.")
                )

        return attrs


class CompanySerializer(serializers.ModelSerializer):
    shareholders = ShareholderSerializer(many=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "code",
            "date_established",
            "capital",
            "shareholders",
        ]

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def create(self, validated_data):
        shareholders_data = validated_data.pop('shareholders')
        company = super().create(validated_data)
        for data in shareholders_data:
            Shareholder.objects.create(target_company=company, is_founder=True, **data)
        return company

    def validate(self, attrs):
        if "shareholders" in attrs:
            shares = list(map(lambda x: x["target_company_share"], attrs["shareholders"]))
            if sum(shares) != attrs["capital"]:
                raise serializers.ValidationError(
                    _("The sum of shares must be equal to the company's capital")
                    )
        if attrs["date_established"] > date.today():
            raise serializers.ValidationError(
                {"date_established": _("Future dates are not allowed")})
        return attrs
