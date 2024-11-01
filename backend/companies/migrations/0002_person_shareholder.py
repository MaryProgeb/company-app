# Generated by Django 4.2.16 on 2024-10-30 13:42

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('code', models.CharField(unique=True, validators=[django.core.validators.MinLengthValidator(11), django.core.validators.MaxLengthValidator(11)])),
            ],
        ),
        migrations.CreateModel(
            name='Shareholder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('PERSON', 'Person'), ('COMPANY', 'Company')], default='PERSON', max_length=7)),
                ('target_company_share', models.PositiveBigIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('company', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='+', to='companies.company')),
                ('person', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='+', to='companies.person')),
                ('target_company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shareholders', to='companies.company')),
            ],
        ),
    ]
