
$('#registerUser').on('submit', function() {
var registerUser = function () {
        superagent.post('users')
        .send({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          })
        .then(function (err, res) { console.log(err, res) })
      };

      return false
})