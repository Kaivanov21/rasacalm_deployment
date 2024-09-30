# Rasa Pro CALM Chatbot Deployment
Deploying Rasa Pro CALM Chatbot over Google Cloud Platform using Docker.

### For deploying over GCP Compute Engine we need to follow these steps:
- Create the VM instance of Ubuntu over Compute Engine
- Login to the VM using SSH
- Run the below commands and clone our Docker app:
 
#### Install Docker

- > ```sudo apt-get update```
- > ```curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add``` 
- > ```sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"```
- > ```sudo apt-get update```
- > ```apt-cache policy docker-ce```
- > ```sudo apt-get install -y docker-ce```
     
#### Install Docker-Compose

- > ```sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose```
- > ```sudo chmod +x /usr/local/bin/docker-compose```

#### Verify Installation

- > ```docker --version```
- > ```docker-compose --version```

#### Clone project from GitHub repository:

- > ```git clone https://github.com/Kaivanov21/rasacalm_deployment```

Create and upload ```.env``` file with Rasa Pro Developer Edition Extended License Key [https://rasa.com/rasa-pro-developer-edition-extended-license-key-request/] and OpenAI API Key [https://platform.openai.com/api-keys]:

```
RASA_PRO_LICENSE=<your Rasa Pro license goes here>
OPENAI_API_KEY=<your OpenAI API key goes here>
```

- > ```sudo cp .env rasacalm_deployment```
- > ```cd rasacalm_deployment/actions```
- > ```chmod +x entrypoint.sh```
- > ```cd ..```

#### Install GNU screen:

- > ```sudo apt-get update```
- > ```sudo apt-get upgrade```
- > ```sudo apt-get install screen```

- > ```screen```

#### Build and run Docker app

- > ```sudo docker-compose up --build```

Detach screen session using ```Ctrl + A```, and then ```Ctrl + D```.

- Now all the services are up and running, and we can interact with our chatbot by opening the ip address of VM in the browser, changing the address to ```http```:

For example:

http://34.32.2.189/ 



