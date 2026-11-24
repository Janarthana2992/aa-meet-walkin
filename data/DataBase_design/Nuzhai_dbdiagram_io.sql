Enum association_membership_type {
  PATRON_MEMBER
  LIFE_MEMBER
  REGISTERED_MEMBER
}

Enum event_type {
  CHAPTER_EVENT
  ANNUAL_MEET
  SPECIAL_EVENT
}

Enum pre_registration_response_status {
  GOING
  MAY_BE
  NOT_GOING
}

Enum registration_source {
  PRE_REGISTERED
  ON_SPOT
}

Enum registration_membership_type {
  PATRON_MEMBER
  LIFE_MEMBER
  REGISTERED_MEMBER
  UNREGISTERED_MEMBER
}

Enum payment_mode {
  ONLINE
  CASH
}

Enum course_type {
  BE
  ME
  MCA
}

Enum stream_type {
  AUTO
  CIVIL
  CTRANS
  CSE
  EEE
  ECE
  IT
  MECH
  STRUCT
  THERM
  TRANS
}

Table association_members [headercolor: #e67e22] {
  member_login_id varchar(100) [pk, not null, note: 'Unique member login id from the website']
  full_name varchar(255) [not null]
  email varchar(200) [not null, unique]
  mobile varchar(20)
  course course_type
  stream stream_type
  graduating_year integer
  city varchar(100)
  state varchar(100)
  pincode varchar(20)
  membership_type association_membership_type [not null]
  imported_at timestamp [default: `now()`]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  Note: 'Local member master containing only recognized members imported from the website'
}

Table events [headercolor: #34495e] {
  event_id integer [pk, increment]
  event_name varchar(255) [not null]
  event_type event_type [not null]
  chapter_name varchar(150) [not null, note: 'Chapter or organizing unit name']
  venue varchar(255)
  event_date date [not null, note: 'Primary event day. Events are typically single-day']
  description text
  is_active boolean [not null, default: true]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  Note: 'Centrally managed event master for chapter events and annual alumni meets'
}

Table event_fee_configurations [headercolor: #34495e] {
  fee_configuration_id integer [pk, increment]
  event_id integer [not null]
  min_graduating_year integer [not null]
  max_graduating_year integer [not null]
  membership_type registration_membership_type [not null]
  registration_fee decimal(10,2) [not null, default: 0]
  display_order integer [default: 0]
  is_active boolean [not null, default: true]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    (event_id, membership_type, min_graduating_year, max_graduating_year) [unique, name: 'uq_event_fee_rule']
  }

  Note: 'Per-event fee rules driven by graduation year range and membership type'
}

Table event_pre_registrations {
  pre_registration_id integer [pk, increment]
  event_id integer [not null]
  member_login_id varchar(100) [note: 'Website member login id when available']
  full_name varchar(255) [not null]
  course varchar(100)
  stream varchar(100)
  graduating_year integer
  email varchar(200) [not null]
  mobile varchar(20)
  membership_type registration_membership_type [not null, note: 'Imported membership classification used for planning and prefilling']
  food_preference varchar(100)
  accompanying_alumni_count integer [not null, default: 0]
  accompanying_family_count integer [not null, default: 0]
  response_status pre_registration_response_status [not null]
  imported_at timestamp [default: `now()`]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    event_id
    email
    mobile
    member_login_id
    (event_id, email) [name: 'idx_pre_registration_event_email']
  }

  Note: 'Imported website pre-registration data used for logistics, statistics, and registration prefill'
}

Table event_registrations [headercolor: #9b59b6] {
  registration_id integer [pk, increment]
  event_id integer [not null]
  member_login_id varchar(100) [note: 'Website member login id when available']
  full_name varchar(255) [not null]
  email varchar(200) [not null]
  mobile varchar(20)
  course varchar(100)
  stream varchar(100)
  graduating_year integer
  membership_type_used registration_membership_type [not null]
  registration_source registration_source [not null]
  recognized_member boolean [not null, default: false, note: 'True when attendee was identified as a recognized member from local member master']
  food_preference varchar(100)
  accompanying_alumni_count integer [not null, default: 0]
  accompanying_family_count integer [not null, default: 0]
  registration_fee decimal(10,2) [not null, default: 0]
  voluntary_contribution decimal(10,2) [not null, default: 0]
  total_amount decimal(10,2) [not null, default: 0]
  payment_required boolean [not null, default: true]
  payment_mode payment_mode
  payment_confirmed boolean [not null, default: false]
  utr_last4 varchar(4) [note: 'Last 4 digits of UTR/reference when applicable']
  paid_at timestamp
  checked_in_at timestamp [not null, default: `now()`]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  indexes {
    (event_id, email) [unique, name: 'uq_event_registration_email']
    member_login_id
    mobile
    checked_in_at
  }

  Note: 'Final event-day registration and check-in snapshot. No FK to member master or pre-registration by design'
}

Ref: event_fee_configurations.event_id > events.event_id
Ref: event_pre_registrations.event_id > events.event_id
Ref: event_registrations.event_id > events.event_id
