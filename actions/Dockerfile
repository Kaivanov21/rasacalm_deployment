FROM rasa/rasa-sdk:3.8.0

 # The Rasa SDK image runs as non-root user by default. Hence, you have to switch
 # back to the `root` user if you want to install additional dependencies
USER root


WORKDIR /app/actions
COPY requirements-actions.txt .

# Install Rasa
USER root
RUN pip install uv
RUN uv pip install rasa-pro --extra-index-url=https://europe-west3-python.pkg.dev/rasa-releases/rasa-pro-python/simple/ rasa-pro==3.8.0

RUN pip install -r ./requirements-actions.txt
COPY entrypoint.sh .
RUN chmod +x /app/actions/entrypoint.sh
ENTRYPOINT [ "./entrypoint.sh" ]

# Switch back to a non-root user

