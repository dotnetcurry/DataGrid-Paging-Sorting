/// <reference path="../jquery-2.1.1.min.js" />
/// <reference path="../knockout-3.2.0.js" />


    var self = this;
    //S1:Flag to check wheather the operation is for Edit and New Record
    var IsNewRecord = false;

    self.Employees = ko.observableArray([]);
    self.Message = ko.observable(); //The Observable for displaying Message


//The Logic for Pagination Here
    self.pageRowSize = ko.observable(5); // The Default No of Rows on the Table.
    self.currentPage = ko.observable(0); // The current Page.
    self.paginationEmployee = ko.observableArray(); // The declaration for Paginated data storing .



    //The computed declaration for the number of display of records 

    self.page = ko.computed(function () {
        //Logic for displaying number of rows in the table
        if (self.pageRowSize() == "all") {
            self.paginationEmployee(self.Employees.slice(0));
        } else {
            var pgSize = parseInt(self.pageRowSize(), 10),
             fisrt = pgSize * self.currentPage(),
             last = fisrt + pgSize;

            self.paginationEmployee(self.Employees.slice(fisrt, last));
        }

    }, self);

    //The function for the total number of pages
    self.totalPages = function () {
        var totpages = self.Employees().length / self.pageRowSize() || 1;
        return Math.ceil(totpages);
    }

    //The function for Next Page
    self.nextPage = function () {
        if (self.currentPage() < self.totalPages() - 1) {
            self.currentPage(self.currentPage() + 1);
        }
    }
    //The function for Previous Page
    self.previousPage = function () {
        if (self.currentPage() > 0) {
            self.currentPage(self.currentPage() - 1);
        }
    }

    //The First Page
    self.firstPage = function () {
        self.currentPage(0);
    }

    //The Last Page
    self.lastPage = function () {
        self.currentPage(self.totalPages() + 1)
    }


//Ends Here


    loadEmployees();


//Logic for Sorting based on Column Header

//S1: An Observable Array declaration for
    self.tableHeadersCaptions = ko.observableArray([
        { caption: 'EmpNo', sortKeyName: 'EmpNo', ascending: true },
        { caption: 'EmpName', sortKeyName: 'EmpName', ascending: true },
        { caption: 'DeptName', sortKeyName: 'DeptName', ascending: true },
        { caption: 'Designation', sortKeyName: 'Designation', ascending: true },
        { caption: 'Salary', sortKeyName: 'Salary', ascending: true }
    ]);

//S2: The Default Sort
    self.defaultSort = self.tableHeadersCaptions[0];


        //S3: The function for sort
    
    self.sortAscDesc = function (h, e) {

        if (self.defaultSort === h) {
                h.ascending = !h.ascending; //toggle across asc and desc Soring 
            } else {
                self.defaultSort = h; //first click store as the default action
            }
        var key = self.defaultSort.sortKeyName;


           //The Ascending Sort
        var sortingAsc = function (l, r) { return l[key] < r[key] ? -1 : l[key] > r[key] ? 1 : l[key] == r[key] ? 0 : 0; };

            //The Descending Sort
        var sortingDesc = function (l, r) { return l[key] > r[key] ? -1 : l[key] < r[key] ? 1 : l[key] == r[key] ? 0 : 0; };

           

            //The Sorting condition
            var sorting = self.defaultSort.ascending ? sortingAsc : sortingDesc;

        
            //Apply the effect on the Array
            self.paginationEmployee.sort(sorting);
        };

        //Ends Here





    
//Logic for CRUD Operations

        //S2:Method to Load all Employees by making Ajax call to WEB API GET method
        function loadEmployees() {
            alert("In Load");
            $.ajax({
                type: "GET",
                url: "/api/EmployeesAPI",
                success: function (data) {
                    self.Message("Success");
                    self.Employees(data);
                },
                error: function (err) {
                    alert(err.status + " <--------------->");
                }
            });

        };

        //S3:The Employee Object
        function Employee(eno, ename, dname, desig, sal) {
            return {
                EmpNo: ko.observable(eno),
                EmpName: ko.observable(ename),
                DeptName: ko.observable(dname),
                Designation: ko.observable(desig),
                Salary: ko.observable(sal)
            }
        };

        //S4:The ViewModel where the Templates are initialized
        var OperationsViewModel = {
            displayOnlyTemplate: ko.observable("displayOnlyTemplate"),
            updateTemplate: ko.observable()
        };

        //S5:Method to decide which Template is used (displayOnlyTemplate or updateTemplate)
        OperationsViewModel.currentTemplate = function (tmpl) {
            return tmpl === this.updateTemplate() ? 'updateTemplate' : this.displayOnlyTemplate();
        }.bind(OperationsViewModel);

        //S6:Method to create a new Blabk entry When the Add New Record button is clicked
        OperationsViewModel.addnewRecord = function () {
            //self.Employees.push(new Employee(0, "", "", "", 0.0));
           self.paginationEmployee.push(new Employee(0, "", "", "", 0.0));
            IsNewRecord = true; //Set the Check for the New Record
        };


        //S7:Method to Save the Record (This is used for Edit and Add New Record)
        OperationsViewModel.saveEmployee = function (d) {

            var Emp = {};
            Emp.EmpNo = d.EmpNo;
            Emp.EmpName = d.EmpName;
            Emp.DeptName = d.DeptName;
            Emp.Designation = d.Designation;
            Emp.Salary = d.Salary;
            //Edit teh Record
            if (IsNewRecord === false) {
                $.ajax({
                    type: "PUT",
                    url: "/api/EmployeesAPI/" + Emp.EmpNo,
                    data: Emp,
                    success: function (data) {
                        self.Message("Record Updated Successfully");
                        OperationsViewModel.reset();
                    },
                    error: function (err) {
                        self.Message("Error Occures, Please Reload the Page and Try Again " + err.status);
                        OperationsViewModel.reset();
                    }
                });
            }
            //The New Record
            if (IsNewRecord === true) {
                IsNewRecord = false;
                $.ajax({
                    type: "POST",
                    url: "/api/EmployeesAPI",
                    data: Emp,
                    success: function (data) {
                        self.Message("Record Added Successfully " + data.status);
                        OperationsViewModel.reset();
                        loadEmployees();
                    },
                    error: function (err) {
                        alert("Error Occures, Please Reload the Page and Try Again " + err.status);
                        OperationsViewModel.reset();
                    }
                });
            }
        };

        //S8:Method to Delete the Record
        OperationsViewModel.deleteEmployee = function (d) {

            $.ajax({
                type: "DELETE",
                url: "/api/EmployeesAPI/" + d.EmpNo,
                success: function (data) {
                    self.Message("Record Deleted Successfully ");
                    OperationsViewModel.reset();
                    loadEmployees();
                },
                error: function (err) {
                    self.Message("Error Occures, Please Reload the Page and Try Again " + err.status);
                    OperationsViewModel.reset();
                }
            });
        };

        //S9:Method to Reset the template 
        OperationsViewModel.reset = function (t) {
            this.updateTemplate("displayOnlyTemplate");
        };
        ko.applyBindings(OperationsViewModel);
//Ends Here