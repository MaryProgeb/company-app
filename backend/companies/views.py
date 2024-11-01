from itertools import chain
from django.db.models import F, Q
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Company, Person, Shareholder
from .serializers import CompanySerializer, PersonSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    http_method_names = ["get", "post", "head"]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

    @action(detail=False)
    def search(self, request):
        if ("q" not in request.query_params) or (request.query_params["q"] == ""):
            return Response()

        query = request.query_params["q"]
        companies = Company.objects.filter(
            Q(name__icontains=query) | Q(code__contains=query)
            ).values(
                "pk",
                "name",
                "code"
                )

        shareholders_companies = Shareholder.objects.filter(
            Q(person__name__icontains=query) | Q(person__code__contains=query)
            ).values(
                pk=F("target_company__pk"),
                code=F("target_company__code"),
                name=F("target_company__name"),
                )

        combined_results = list(chain(companies, shareholders_companies))

        return Response(combined_results)


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']
