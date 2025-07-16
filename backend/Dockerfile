FROM python:3.9

WORKDIR /code

# Install pg_isready (part of postgresql-client)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

EXPOSE 80

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

#CMD ["fastapi", "run", "app/main.py", "--port", "80"]
CMD ["/entrypoint.sh"]