function welcomeMessage(user:{
    name:string,
    email:string
}){
    return `Welcome ${user.name} your email is ${user.email}`
}

console.log(welcomeMessage({
    name:"jyotishankar",
    email:"jyotishankar@qwikish.com"
}))