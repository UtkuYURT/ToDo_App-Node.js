import Task from "../models/task.js";

export const getIndex = (req, res, next) => {
  if (!req.session.user) {
    return res.render("user/index", {
      title: "Kullanıcı Sayfası",
      path: "/",
      showNavbar: true,
    });
  }

  let sortOption = {};
  const sort = req.query.sort;
  if (sort === "new") sortOption = { createdAt: -1 };
  else if (sort === "old") sortOption = { createdAt: 1 };
  else if (sort === "end") sortOption = { endAt: 1, priority: -1 };
  else if (sort === "pri") sortOption = { priority: -1, endAt: 1 };

  Task.find({ userId: req.session.user._id })
    .sort(sortOption)
    .then((tasks) => {
      res.render("user/index", {
        title: "Kullanıcı Sayfası",
        path: "/",
        tasks: tasks,
        showNavbar: true,
        user: req.session.user,
        sort: sort,
      });
    });
};

export const getAddTask = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("user/add-task", {
    title: "Görev Ekle",
    path: "/add-task",
    user: req.session.user,
    showNavbar: true,
    sort: req.query.sort,
  });
};

export const postAddTask = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const taskName = req.body.taskName;
  const priority = req.body.priority;
  const rawEndAt = req.body.endAt;

  let endAt;
  if (rawEndAt) {
    endAt = new Date(rawEndAt + "T23:59:59.999Z");
  }

  const sort = req.body.sort;

  const newTask = new Task({
    taskName: taskName,
    userId: req.session.user._id,
    endAt: endAt,
    priority: priority,
  });

  return newTask
    .save()
    .then(() => {
      res.redirect("/?sort=" + sort);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.render("user/add-task", {
          title: "Görev Ekle",
          errorMessage: err.message.replace(
            "Task validation failed: endAt: ",
            ""
          ),
          user: req.session.user,
          showNavbar: true,
          path: "/add-task",
          values: {
            taskName: taskName,
            priority: priority,
          },
        });
      }
    });
};

export const getConfirmedTasks = (req, res, next) => {
  if (!req.session.user) {
    res.render("user/index", {
      title: "Kullanıcı Sayfası",
      path: "/",
      showNavbar: true,
    });
  }

  Task.find({ userId: req.session.user._id, isCompleted: true })
    .then((tasks) => {
      res.render("user/confirmed-tasks", {
        title: "Onaylanmış Görevler",
        path: "/confirmed-tasks",
        tasks: tasks,
        showNavbar: true,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

export const postConfirmTask = (req, res, next) => {
  const taskId = req.body.taskId;

  Task.findOne({ _id: taskId, userId: req.session.user._id })
    .then((task) => {
      if (!task) {
        return res.redirect("/");
      }

      task.isCompleted = !task.isCompleted;
      return task.save().then(() => {
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

export const postDeleteTask = (req, res, next) => {
  const taskId = req.params.taskId;

  const sort = req.body.sort;
  console.log(sort);

  Task.deleteOne({ _id: taskId, userId: req.session.user._id })
    .then(() => {
      res.redirect("/?sort=" + sort);
    })
    .catch((err) => {
      console.error(err);
    });
};

export const getEditTask = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const taskId = req.params.taskId;

  Task.findOne({ _id: taskId, userId: req.session.user._id })
    .then((task) => {
      if (!task) {
        return res.redirect("/");
      }

      res.render("user/edit-task", {
        title: "Görev Düzenle",
        user: req.session.user,
        showNavbar: true,
        task: task,
        path: "/edit-task",
        sort: req.query.sort,
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

export const postEditTask = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const taskId = req.body.taskId;
  const taskName = req.body.taskName;
  const priority = req.body.priority;
  const rawEndAt = req.body.endAt;
  const sort = req.body.sort;

  let endAt;
  if (rawEndAt) {
    endAt = new Date(rawEndAt + "T23:59:59.999Z");
  }

  Task.findOneAndUpdate(
    { _id: taskId, userId: req.session.user._id },
    {
      taskName: taskName,
      priority: priority,
      endAt: endAt,
    },
    {
      new: true,
    }
  ).then((updatedTask) => {
    if (!updatedTask) {
      return res.redirect("/");
    }

    res.redirect("/?sort=" + sort);
  });
};

export const getProfile = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  Task.find({ userId: req.session.user._id }).then((tasks) => {
    let totalTasks;
    let completedTasks;

    if (!tasks) {
      totalTasks = 0;
      completedTasks = 0;
    }

    totalTasks = tasks.length;
    completedTasks = tasks.filter((task) => task.isCompleted).length;

    res.render("user/profile", {
      title: "Kullanıcı Profili",
      path: "/profile",
      totalTasks: totalTasks,
      completedTasks: completedTasks,
      showNavbar: true,
      user: req.session.user,
    });
  });
};

export const getProfileUpdate = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("user/profile-update", {
    title: "Profil Güncelleme",
    showNavbar: true,
    user: req.session.user,
  });
};

export const getSecuritySettings = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.render("user/security-settings", {
    title: "Güvenlik Ayarları",
    path: "/security-settings",
    showNavbar: true,
    user: req.session.user,
  });
};

export default {
  getIndex,
  getAddTask,
  postAddTask,
  getConfirmedTasks,
  postConfirmTask,
  postDeleteTask,
  getEditTask,
  postEditTask,
  getProfile,
  getProfileUpdate,
  getSecuritySettings,
};
