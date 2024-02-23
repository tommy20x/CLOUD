import axios from "axios";

export default axios.create({
  baseURL: "http://35.202.101.5:4299/be/pm",
  headers: {
    "Content-type": "application/json",
    "common": {
      //  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZUxvZ2dlZGluQXNIUmlkIjo1LCJteUFjdHVhbEhSaWQiOjUsInRva2VuR3JhbnRlZFRpbWVHTVQiOjE2MTEzMDkzMjAyMjMsImlhdCI6MTYxMTMwOTMyMCwiZXhwIjoxNjE2NDkzMzIwfQ.-7kZMQGMFvr-iTxGDAynWFys_Uf6hZw4ShTmj-OJmD8",
      "authorization": "Bearer " + localStorage.getItem('pmFE001')
    },
  }
});

