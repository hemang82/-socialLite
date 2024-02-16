exports.sendOtp = (result,otp,callback)=>{
    var template =`
    <h1>otp send ${otp} from Demop app</h1>
    `;
    callback(template)
}
exports.welcomeEmail = (result,callback)=>{
    
    var template =`
    <h1>Welcome to Demo app</h1>
    `;

    callback(template)
}
exports.loginEmail = (result,callback)=>{

    var template =`
    <h1>Login Success For Demo App</h1>
    `;
    callback(template)

}
exports.forgotEmail = (result,callback)=>{
    var template =`
    <h1>dear ${result.email} You can change the PASSWORD  <a href="http://localhost:2307/api/v1/auth/resetfile/${result.id}"> Click hear</a></h1>
    `;
    callback(template)
}

exports.contactPage = (result,callback)=>{
    var template =`
    <h1>thank you for contect Demo app</h1>
    `;
    callback(template)
}