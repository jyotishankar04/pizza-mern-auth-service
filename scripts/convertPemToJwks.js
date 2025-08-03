/* eslint-disable no-undef */
import fs from "fs";
import rsaPemToJwks from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("./certs/private.pem");
const jwk = rsaPemToJwks(privateKey,{ use: "sig", alg: "RS256" },"public");
console.log(jwk);