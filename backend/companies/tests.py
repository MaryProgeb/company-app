import copy
from datetime import datetime, date, timedelta

from django.test import TestCase

from .models import Company, Person
from rest_framework import status
from rest_framework.test import APIClient
from unittest import mock

DATE_FORMAT = "%Y-%m-%d"

class CompaniesAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_get_all_companies(self):
        companyA = Company.objects.create(name="Company A", code=11111111, date_established = datetime.now())
        companyB = Company.objects.create(name="Company B", code=22222222, date_established = datetime.now())

        response = self.client.get('/companies/')
        resp = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([{
            "id": mock.ANY,
            "name": company.name,
            "code": company.code,
            "date_established": company.date_established.strftime(DATE_FORMAT),
            "capital": company.capital,
            "shareholders": []
        } for company in (companyA, companyB)], resp)

    def test_get_company(self):
        company = Company.objects.create(name="Company A", code=11111111, date_established = datetime.now())

        response = self.client.get(f'/companies/{company.pk}/')
        resp = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual({
            "id": mock.ANY,
            "name": company.name,
            "code": company.code,
            "date_established": company.date_established.strftime(DATE_FORMAT),
            "capital": company.capital,
            "shareholders": []
        }, resp)

    def test_create_company(self):
        target_company = Company(name="Company A", code=11111111, date_established=datetime.now())
        person = Person.objects.create(name="John Doe", code="36005240220")
        company = Company.objects.create(name="Company B", code=22222222, date_established = datetime.now())

        payload = {
            "name": target_company.name,
            "code": target_company.code,
            "date_established": target_company.date_established.strftime(DATE_FORMAT),
            "capital": 2500,
            "shareholders": [
                {
                    "type": "PERSON",
                    "person": person.pk,
                    "target_company_share": 1250,
                },
                {
                    "type": "COMPANY",
                    "company": company.pk,
                    "target_company_share": 1250,
                },
            ]
        }

        with self.subTest("Creating a company fails if shareholders shares sum is not equal to the company's capital"):
            payload_copy = copy.deepcopy(payload)
            payload_copy["shareholders"][0]["target_company_share"] = 1500

            response = self.client.post(f"/companies/", payload_copy, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

            resp = response.json()
            self.assertEqual({'non_field_errors': ["The sum of shares must be equal to the company's capital"]}, resp)

        with self.subTest("Creating a company fails if date established is in the past"):
            payload_copy = copy.deepcopy(payload)
            payload_copy["date_established"] = date.today() + timedelta(days = 1)

            response = self.client.post(f"/companies/", payload_copy, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            resp = response.json()
            self.assertEqual({'date_established': ['Future dates are not allowed']}, resp)

        response = self.client.post(f"/companies/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        resp = response.json()
        self.assertEqual({
            "id": mock.ANY,
            "name": target_company.name,
            "code": target_company.code,
            "date_established": target_company.date_established.strftime(DATE_FORMAT),
            "capital": target_company.capital,
            "shareholders": [
                {
                    "type": "PERSON",
                    "person": person.pk,
                    "person__name": person.name,
                    "person__code": person.code,
                    "company": None,
                    "target_company_share": 1250,
                    "is_founder": True,
                },
                {
                    "type": "COMPANY",
                    "company": company.pk,
                    "company__name": company.name,
                    "company__code": str(company.code),
                    "person": None,
                    "target_company_share": 1250,
                    "is_founder": True,
                }
            ]
        }, resp)
