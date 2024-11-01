# Generated by Django 4.2.16 on 2024-10-30 13:17

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(unique=True, validators=[django.core.validators.MinLengthValidator(3), django.core.validators.MaxLengthValidator(100)])),
                ('code', models.PositiveIntegerField(unique=True, validators=[django.core.validators.MinValueValidator(10000000), django.core.validators.MaxValueValidator(99999999)])),
                ('date_established', models.DateField()),
                ('capital', models.PositiveBigIntegerField(default=2500, validators=[django.core.validators.MinValueValidator(2500)])),
            ],
        ),
    ]
