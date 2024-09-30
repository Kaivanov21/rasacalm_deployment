FROM rasa/rasa-sdk:3.8.0

WORKDIR /app

COPY . /app

USER root
RUN pip install uv

RUN uv pip install rasa-pro --extra-index-url=https://europe-west3-python.pkg.dev/rasa-releases/rasa-pro-python/simple/ rasa-pro==3.8.0
COPY entrypoint.sh .

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT [ "./entrypoint.sh" ]
