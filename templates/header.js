window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['header'] = `
<header id="page_header">
  <a class="logo" href="#!/index/index">{{app_name}}</a>

  <nav class="menu_main">
    <ul class="clean_list" data-status="loggedin">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/users/profile">{{menu_profile}}</a></li>
      <li><a href="#!/users/wallets">{{menu_wallets}}</a></li>
      <li><a href="#!/users/deposit">{{menu_deposit}}</a></li>
      <li><a href="#!/users/withdraw">{{menu_withdraw}}</a></li>
      <li><a href="#!/plans/index">{{menu_plans}}</a></li>
      <li data-isadmin><a href="#!/admin/dashboard">{{menu_admin}}</a></li>
      <li><a href="#!/users/logout">{{menu_logout}}</a></li>
    </ul>

    <ul class="clean_list" data-status="loggedout">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/users/login">{{menu_login}}</a></li>
      <li><a href="#!/users/registration">{{menu_registration}}</a></li>
      <li><a href="#!/index/imprint">{{menu_imprint}}</a></li>
      <li><a href="#!/index/privacy">{{menu_privacy}}</a></li>
    </ul>
  </nav>
</header>
`.trim();
