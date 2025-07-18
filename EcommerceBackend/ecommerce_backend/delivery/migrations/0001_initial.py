# Generated by Django 5.1.6 on 2025-03-23 08:13

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AvailableDelivery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_available', models.BooleanField(default=True)),
                ('phone_number', models.CharField(blank=True, max_length=20, null=True)),
                ('user', models.OneToOneField(limit_choices_to={'role': 'delivery'}, on_delete=django.db.models.deletion.CASCADE, related_name='delivery_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
