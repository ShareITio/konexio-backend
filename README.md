# aws-lambda-konexio

Le code source des **AWS LAMBDA** et **Airtable Sripts** de Konexio.

Tous les Airtable Sripts de Konexio sont accessible depuis `./airtable`. 
La documentation y est également accessible [ici](https://github.com/ShareITio/aws-lambda-konexio/tree/master/airtable).

### Installation

Pour installer le projet, il suffit de lancer :

```shell
> npm i
```

Et ajouter ses variables d'environnements dans un `.env` à la racine du projet :
```
TWILIO_ACCOUNT_SID=<votre id de compte twillio>
TWILIO_AUTH_TOKEN=<votre token d'autentification>
TWILIO_PHONE=<le numéro twilio à utiliser>
```

### Tester en local

```shell
> npm test
```

### Mettre à jour la AWS LAMBDA

```shell
> npm run zip-update
```
