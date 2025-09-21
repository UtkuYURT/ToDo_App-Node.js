import User from "../models/user.js";
import Task from "../models/task.js";
import bcrypt from "bcrypt";

export const getLogin = (req, res, next) => {
  res.render("account/login", {
    title: "Giriş Yap",
    path: "/login",
    showNavbar: false,
  });
};

export const postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.render("account/login", {
          title: "Giriş Yap",
          errorMessage: "Geçersiz email",
          path: "/login",
          showNavbar: false,
        });
      }

      return bcrypt.compare(password, user.password).then((doMatch) => {
        if (!doMatch) {
          return res.render("account/login", {
            title: "Giriş Yap",
            errorMessage: "Geçersiz şifre",
            values: { email: email },
            path: "/login",
            showNavbar: false,
          });
        }

        req.session.user = user;
        req.session.isLoggedIn = true;

        return req.session.save(() => {
          res.redirect("/");
        });
      });
    })
    .catch((err) => {
      console.error("Giriş yaparken bir hata oluştu: ", err);
    });
};

export const getRegister = (req, res, next) => {
  res.render("account/register", {
    title: "Kayıt Ol",
    path: "/register",
    showNavbar: false,
  });
};

export const postRegister = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;

  if (password.length < 5 || confirmPassword.length < 5) {
    return res.render("account/register", {
      title: "Kayıt Ol",
      errorMessage: "Şifreler en az 6 karakter uzunluğunda olmalıdır.",
      values: { name: name, email: email },
      path: "/register",
      showNavbar: false,
    });
  }

  if (password !== confirmPassword) {
    return res.render("account/register", {
      title: "Kayıt Ol",
      errorMessage: "Şifreler eşleşmiyor",
      values: { name: name, email: email },
      path: "/register",
      showNavbar: false,
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.render("account/register", {
          title: "Kayıt Ol",
          errorMessage: "Bu email zaten kayıtlı.",
          values: {
            name: name,
            password: password,
            confirmPassword: confirmPassword,
          },
          path: "/register",
          showNavbar: false,
        });
      }

      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        role: "user",
      });

      return newUser.save();
    })
    .then(() => {
      res.render("account/login", {
        title: "Giriş Yap",
        path: "/login",
        showNavbar: false,
      });
    })
    .catch((err) => {
      console.error("Kullanıcı oluştururken bir hata oluştu: ", err);
    });
};

export const getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Çıkış yaparken bir hata oluştu: ", err);
    }
    res.redirect("/");
  });
};

export const postProfileUpdate = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const userId = req.body.userId;
  const name = req.body.name;
  const email = req.body.email;

  User.find({ _id: userId })
    .then((user) => {
      if (!user) {
        return redirect("/");
      }

      user.name = name;
      user.email = email;

      Task.find({ userId: userId }).then((tasks) => {
        let totalTasks = tasks.length;
        let completedTasks = tasks.filter((task) => task.isCompleted).length;

        User.findOneAndUpdate(
          { _id: userId },
          { name: name, email: email },
          { new: true }
        ).then(() => {
          User.findById(userId).then((updatedUser) => {
            req.session.user = updatedUser;

            req.session.save(() => {
              res.render("user/profile", {
                title: "Kullanıcı Profili",
                user: req.session.user,
                path: "/profile",
                showNavbar: true,
                successMessage: "Profil başarıyla güncellendi.",
                totalTasks: totalTasks,
                completedTasks: completedTasks,
              });
            });
          });
        });
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

export const postUpdatePassword = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const userId = req.body.userId;
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const newConfirmPassword = req.body.newConfirmPassword;

  bcrypt.compare(currentPassword, req.session.user.password).then((isMatch) => {
    if (!isMatch) {
      return res.render("user/security-settings", {
        title: "Güvenlik Ayarları",
        path: "/security-settings",
        showNavbar: true,
        user: req.session.user,
        errorMessage: "Mevcut şifre yanlış.",
      });
    }

    if (currentPassword === newPassword) {
      return res.render("user/security-settings", {
        title: "Güvenlik Ayarları",
        path: "/security-settings",
        showNavbar: true,
        user: req.session.user,
        errorMessage: "Yeni şifre mevcut şifre ile aynı olamaz.",
      });
    }

    if (newPassword !== newConfirmPassword) {
      return res.render("user/security-settings", {
        title: "Güvenlik Ayarları",
        path: "/security-settings",
        showNavbar: true,
        user: req.session.user,
        errorMessage: "Yeni şifreler eşleşmiyor.",
      });
    }

    bcrypt
      .hash(newPassword, 12)
      .then((hashedPassword) => {
        User.findOneAndUpdate(
          { _id: userId },
          { password: hashedPassword },
          { new: true }
        ).then(() => {
          req.session.destroy(() => {
            res.render("account/login", {
              title: "Giriş Yap",
              path: "/login",
              showNavbar: false,
            });
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

export default {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  getLogout,
  postProfileUpdate,
  postUpdatePassword,
};
