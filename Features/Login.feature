Feature: Validate practicetestautomationlogin page

        Background:
            Given I navigate to the practicetestautomationlogin page

# Positive scenarios

        @Positive @ValidLogin
        Scenario: Login with valid credentials
             When I login with username "student" and password "Password123"
             Then I should be verify success message 'Logged In Successfully'

        @Positive @Relogin
        Scenario: Login, logout and login again
             When I login with username "student" and password "Password123"
             Then I should be verify success message 'Logged In Successfully'
             When I click the Log out button
             When I login with username "student" and password "Password123"
             Then I should be verify success message 'Logged In Successfully'

        @Positive @RefreshAfterLogin
        Scenario: Login persists after refresh
             When I login with username "student" and password "Password123"
             Then I should be verify success message 'Logged In Successfully'
             When I refresh the page
             Then I should be verify success message 'Logged In Successfully'

        @Positive @SpacesInCredentials
        Scenario: Login with leading/trailing spaces in credentials
             When I login with username " student " and password " Password123 "
             Then I should be verify success message 'Logged In Successfully'

# Negative scenarios
        @Negative @InvalidUsername
        Scenario: Login with invalid username
             When I login with username "incorrectUser" and password "Password123"
             Then I should see "Your username is invalid!"
        @Negative @InvalidPassword
        Scenario: Login with invalid password
             When I login with username "student" and password "incorrectPassword"
             Then I should see "Your password is invalid!"
        @Negative @EmptyUsername
        Scenario: Submit with empty username
             When I login with username "" and password "Password123"
             Then I should see "Your username is invalid!"
        @Negative @EmptyPassword
        Scenario: Submit with empty password
             When I login with username "student" and password ""
             Then I should see "Your password is invalid!"
