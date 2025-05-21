variable "project_name" {
  type    = string
  default = "cypress-automation"
}

variable "tags" {
  description = "AWS tags for most resources"
  type        = map(any)
  default = {
    "Primary Contact"                  = "John Smith"
    "organisation_env"                 = "non-prod"
    "organisation_costcentre"          = "1234.6789"
    "organisation_primarycontact"      = "john.citizen@gmail.com"
    "organisation_application"         = "websites"
    "organisation_project"             = "ORGANISATION-PROJECT"
    "organisation_repo"                = false
    "organisation_iac"                 = true
    "organisation_data_classification" = "internal"
    "organisation_research"            = false
  }
}