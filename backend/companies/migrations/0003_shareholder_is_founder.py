# Generated by Django 5.1.2 on 2024-10-31 08:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0002_person_shareholder'),
    ]

    operations = [
        migrations.AddField(
            model_name='shareholder',
            name='is_founder',
            field=models.BooleanField(default=False),
        ),
    ]
