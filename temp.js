
let username = 'theMaverick7'
let email = ''
let password = 'nullPointer'
let fullname = ''

let obj = {
    username: username,
    email: email,
    password: password,
    fullname: fullname
};

for(let key in obj)
{
    if(obj[key] === '')
    {
        console.log(`${key} is required`);
    }
}

