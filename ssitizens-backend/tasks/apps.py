import sys

from django.apps import AppConfig


class TasksConfig(AppConfig):
    name = "tasks"

    def ready(self, *args, **kwargs):
        from tasks.distributetasks import DistributeTask
        from tasks.eventstasks import EventTask
        from tasks.schedulertasks import LaunchScheduler

        is_manage_py = any(arg.casefold().endswith("manage.py") for arg in sys.argv)
        is_runserver = any(arg.casefold() == "runserver" for arg in sys.argv)

        if is_manage_py and is_runserver:
            # only run when runserver command is present
            print(" ====>> TaskConfig <<===")
            LaunchScheduler.start()
            DistributeTask.launch_distribute_batch()
            EventTask.launch_search_events()
