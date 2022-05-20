const baseUrl = 'http://localhost:3000';
let token = localStorage.getItem('HoopsToken');

preInit();

function navBarInit() {
  $('#nav-button-box').show();

  const signUpBtn = $('#signUpModal #btn-signup');
  const loginBtn = $('#loginModal #btn-login');

  // 로그인 팝업 에서 로그인 클릭 시
  loginBtn.on('click', function () {
    const userId = $('#login-user-id').val();
    const passcode = $('#login-user-passcode').val();

    axios
      .post(baseUrl + '/auth/signin', {
        id: userId,
        passcode: passcode
      })
      .then(function (response) {
        let data = response.data;

        localStorage.setItem('HoopsToken', data.data.token);

        alert('로그인에 성공했습니다!');
        $('#loginModal .btn-close').trigger('click');
        location.reload();
        return;
      })
      .catch(function (error) {
        alert('오류가 발생했습니다.');
        $('#loginModal .btn-close').trigger('click');
      });
  });

  // 회원가입 팝업에서 회원가입 클릭 시
  signUpBtn.on('click', function () {
    const userId = $('#signup-user-id').val();
    const userName = $('#signup-user-name').val();
    const passcode = $('#signup-user-passcode').val();
    const passcodeConfirm = $('#signup-user-passcode-confirm').val();

    if (userId.trim().length == 0) {
      alert('아이디를 확인하여 주십시오');
      return;
    }

    if (userName.trim().length == 0) {
      alert('이름을 확인하여 주십시오');
      return;
    }

    if (passcode.trim().length == 0) {
      alert('비밀번호를 확인하여 주십시오');
      return;
    }

    if (passcodeConfirm.trim().length == 0) {
      alert('비밀번호 확인란을 확인하여 주십시오');
      return;
    }

    if (passcode !== passcodeConfirm) {
      alert('비밀번호 확인과 비밀번호가 다릅니다.');
      return;
    }

    axios
      .post(baseUrl + '/auth/signup', {
        id: userId,
        passcode: passcode,
        name: userName
      })
      .then(function (response) {
        let data = response.data;
        let status = data.status;
        let code = data.code;

        if (code === 'SUCCESS') {
          alert('회원가입에 성공했습니다. 로그인 해 주세요.');
          $('#signUpModal .btn-close').trigger('click');
          return;
        }
      })
      .catch(function (error) {
        alert('오류가 발생했습니다.');
        $('#signUpModal .btn-close').trigger('click');
      });
  });
}

function mainInit() {
  // 루틴 Loading
  axios
    .get(baseUrl + '/routain/get_use_routain', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      if (res.data.code === 'SUCCESS') {
        let routain = res.data.data.routain;

        if (routain != undefined) {
          $('.routain-card-spinner').remove();
          $('.routain-button-box').addClass('d-flex');
          $('.is-use-routain').text(routain.name);
          $('.is-use-routain').attr('id', routain.id);

          $('.routain-info').on('click', function () {
            location.href = `/routain-detail?id=${routain.id}`;
          });
        } else {
          // 루틴카드
          $('.routain-card-spinner').remove();
          $('.is-use-routain').text('사용 중인 루틴이 없습니다.');
          //분석카드(Analyze)
          // $('.routain-analyze').empty().text('-');
          // $('.todo-analyze').empty().text('-');
        }
      }
    });

  // to-do Loading
  $('.todo-card-spinner').remove();
  $('.todo-message').text('등록된 To-do가 없습니다.');

  // todo http request

  // Analyze loading
  $('.analyze-card-spinner').remove();
  $('.analyze-content-wrapper').show();
}

function preInit() {
  $('.todo-date').text(new Date().toLocaleDateString());
  $('.routain-button-box').hide();

  if (token != undefined && token.length > 0) {
    // 토큰 검증
    axios
      .post(baseUrl + '/auth/verify_token', { token: token })
      .then((response) => {
        let tokenExpired = response.data.expired;
        let name =
          response.data.name != undefined ? response.data.name + " 's" : '';

        if (!tokenExpired) {
          // 토큰이 만료되지 않았을 떄( 로그인 상태 )
          $('#nav-button-box').hide();
          $('.hoops-title').text(`${name} Hoops`);
          mainInit();
        } else {
          // 만료되었을 때 (로그 아웃 상태 )
          localStorage.removeItem('HoopsToken');
          navBarInit();
        }
      });
  } else {
    navBarInit();
  }
}
