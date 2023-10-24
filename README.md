# **DemoUp assets Backend microservice**

Task #1: https://drive.google.com/file/d/1BrccRD16CtrTSavC0VwCkWIcEQ7Kl-7S/view?usp=sharing

This microservice is made to be flexible in case the developers need to add a graphql server or decide to move from fastify to any other http framework with very little effort

This project separates the model logic from the DB connection and query in case the developer want to move from one DB or ORM to another

Tslint is being deprecated in favor of ESlint and for quick usage I used a popular set of rules

This project has in the docker compose all elements needed to run connect and view the data so that no need of installation of many packages

you can debug this code connecting to the port 9229 to debug with beak points

This project only tackles Assets to Category queries

Things like the Error manager and the HttpService would rather be an internal npm package so can be reused across microservices

# Instructions


## Run project in your local env:

1. you need to have installed docker, docker-compose, nodejs
2. run `npm i`
3. run `npm run docker-run`
4. if you're developing you don't need to rebuilt the whole project every time if you didn't change any code on the docker level you can simply run `npm run build` and the docker instance will load automatically the content
5. run `npm test` for integration test of the endpoints

## Run project in prod env:

1. you need to inject the DB location
2. `docker build -t $IMAGE_NAME:$IMAGE_TAG --label commit-reference=$COMMIT_REF_NAME .`
3. docker push $IMAGE_NAME:$IMAGE_TAG
4. `docker run -e "POSTGRES_URL=postgresql://postgres:changeme@localhost:5432/demoUp?schema=asset_schema" -e "API_PORT:3000" -p 3000:3000 demouptest:1.0.0`
5. this can be run in a kubernetes pod, eks, ecs fargate

## Run migration (ONLY after making any change to .prisma files or adding a new .prisma file):

1. go to prisma/ and rename the file `.env.example` to `.env` and add there you postgres connection string
2. `npm run pg-migrate --name=<MIGRATION_COMMENT>`

**IMPORTANT!** Please do not remove any data under prisma/migrations after an already deployed migration or the data might be all lost


## Connect to the DB to review the data (pgadmin):

Open your browser and go to `http://localhost:5050/` The master password is `admin`

Create a new server connection set a name for the server then set `postgres as the host and username`

The dev password is `changeme`

## Creating a new CRUD

1. Make a new folder with the name of the entity as follows `src/app/api/<ENTITY_NANME>`
2. create a file called `<ENTITY_NANME>.prisma` and add there the DB estructure [SEE THIS LINK FOR DOCUMENTATION](https://www.prisma.io/docs/concepts/components/prisma-schema)
3. Create a file called `idex.ts` and place all your routes in there
6. create a file called `<ENTITY_NANME>.model.ts`
7. create your model and extend it from `BaseModel` this contains all basic DB accessing methods so that you're almost done once you extend it
9. Run a new migration which described above
10. re-build the whole project `npm run docker-run`

## notes:

1.The error manger is made so that you can display user errors in different languages for the sake of the test I left the KEY_ERROR as description but this can be properly filled

2. he endpoints to the other microservices must be injected while running for now is not needed since is commented

3. I added a health-check so that a load balancer or other service can check if the service is up and connected to the DB
