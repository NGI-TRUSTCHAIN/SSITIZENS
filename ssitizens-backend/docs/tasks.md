# Tasks Module Documentation

This document provides an overview of the functionality implemented in the `tasks` module.

---

## Overview

The `tasks` module is responsible for managing scheduled jobs and task execution. It includes functionality for event processing, token distribution, and scheduler management using APScheduler.

---

## Components

### 1. **Scheduler Tasks**
Manages the APScheduler instance and handles the scheduling of jobs.

#### Functions:
- **delete_old_job_executions**:
  - Deletes APScheduler job execution entries older than a specified age from the database.
  - **Parameters**:
    - `max_age` (int): Maximum age (in seconds) for retaining historical job execution records. Defaults to 7 days (604,800 seconds).

#### Class:
- **LaunchScheduler**:
  - Attributes:
    - `scheduler`: An instance of `BackgroundScheduler` configured with the project's timezone.
    - `scheduler_start`: A boolean flag indicating whether the scheduler has been started.
  - Methods:
    - **start**:
      - Starts the scheduler and adds jobs to the job store.
      - Schedules the `delete_old_job_executions` job to run every Monday at midnight.

---

### 2. **Event Tasks**
Handles event-related jobs, such as processing blockchain events.

#### Class:
- **EventTask**:
  - Attributes:
    - `task_id`: Identifier for the task.
    - `task_job`: APScheduler job instance.
  - Methods:
    - **launch_search_events**:
      - Schedules the `search_events` job to run every 10 minutes.
    - **search_events**:
      - Processes blockchain events and updates the database.
    - **get_events**:
      - Retrieves events from the blockchain and saves them as transactions.
    - **event_type**:
      - Maps event types to their corresponding database structure.
    - **save_as_txs**:
      - Saves events as transactions in the database.
    - **get_latest_update_date**:
      - Retrieves the latest update date from the `Register` model.
    - **add_update_date_register**:
      - Updates the `Register` model with the current date.

---

### 3. **Distribute Tasks**
Handles token distribution jobs.

#### Class:
- **DistributeTask**:
  - Attributes:
    - `task_id`: Identifier for the task.
    - `task_job`: APScheduler job instance.
  - Methods:
    - **launch_distribute_batch**:
      - Schedules the `distribute_tokens` job to run daily at 3:00 AM.
    - **distribute_tokens**:
      - Distributes tokens to eligible beneficiaries.
    - **get_profiles**:
      - Retrieves profiles of beneficiaries eligible for token distribution.
    - **get_latest_update_date**:
      - Retrieves the latest update date from the `Register` model.
    - **add_update_date_register**:
      - Updates the `Register` model with the current date.

---

## Notes

- The `tasks` module uses APScheduler for scheduling jobs.
- The `Register` model is used to store metadata related to task execution.
- The `EventTask` and `DistributeTask` classes interact with the blockchain and database to process events and distribute tokens.
- Scheduler tasks ensure periodic cleanup and efficient job management.