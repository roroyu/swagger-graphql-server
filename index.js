const express = require('express')
const app = express()

const graphqlHTTP = require('express-graphql').graphqlHTTP;
// import { createSchema, CallBackendArguments } from 'swagger-to-graphql';
const { createSchema, CallBackendArguments }  = require( 'swagger-to-graphql');

const fetch = require("node-fetch");

// Define your own http client here
// async function callBackend({
//   context,
//   requestOptions,
// // }: CallBackendArguments<Request>) {
// }) {
//   console.log('callBackend: ', context, requestOptions)
//   return 'Not implemented';
// }

async function callBackend({
  requestOptions: { method, body, baseUrl, path, query, headers },
}) {
  // const url = `${baseUrl}${path}?${new URLSearchParams(query as Record<
  //   string,
  //   string
  // >)}`;
  console.log('callBackend: ', { method, body, baseUrl, path, query, headers })
  const url = `${baseUrl}${path}?${new URLSearchParams(query)}`
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (200 <= response.status && response.status < 300) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
  throw new Error(`Response: ${response.status} - ${text}`);
}

// yaml
createSchema({ 
  swaggerSchema: `../gm/poems.yaml`, 
  // swaggerSchema: `../gm/poems.json`, 
  callBackend,
})
  .then(schema => {
    console.log(schema)
    app.use(
      '/graphql',
      graphqlHTTP(() => {
        return {
          schema,
          graphiql: true,
        };
      }),
    );
 
    app.listen(3009, 'localhost', () => {
      console.info('http://localhost:3009/graphql');
    });
  })
  .catch(e => {
    console.log(e);
  });