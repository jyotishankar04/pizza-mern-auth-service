function welcomeMessage(user: { name: string; email: string }) {
    const anotherUser = {
        name: "jyotishankar",
        email: "jyotishankar@qwikish.com",
    };
    return `Welcome ${user.name} your email is ${user.email}`;
}

console.log(
    welcomeMessage({
        name: "jyotishankar",
        email: "jyotishankar@qwikish.com",
    }),
);
