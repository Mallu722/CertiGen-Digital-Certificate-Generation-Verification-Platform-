#!/bin/bash
pip install -r requirements.txt --break-system-packages
python manage.py collectstatic --noinput
python manage.py migrate
python seed_12_templates.py
