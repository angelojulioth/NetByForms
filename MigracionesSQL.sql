-- Crear la base de datos
CREATE DATABASE NetByFormularios;
GO

-- Usar la base de datos recien creada
USE NetByFormularios;
GO

-- crear las tablas
CREATE TABLE Forms (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
	UniqueId NVARCHAR(10) NOT NULL UNIQUE
)	

CREATE TABLE NestedForms (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ParentFormId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    UniqueId NVARCHAR(10) NOT NULL UNIQUE,
    FOREIGN KEY (ParentFormId) REFERENCES Forms(Id)
);

CREATE TABLE FormFields (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FormId INT NOT NULL,
	FormUniqueId NVARCHAR(10) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Label NVARCHAR(100) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Required BIT NOT NULL,
    [Order] INT NOT NULL,
    OptionsJson NVARCHAR(MAX),
	NestedFormId INT NULL,
	FOREIGN KEY (NestedFormId) REFERENCES NestedForms(Id),
    FOREIGN KEY (FormId) REFERENCES Forms(Id)
)

CREATE TABLE FormSubmissions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FormUniqueId NVARCHAR(10) NOT NULL,
    SubmissionData NVARCHAR(MAX) NOT NULL,
    SubmittedAt DATETIME2 NOT NULL,
    FOREIGN KEY (FormUniqueId) REFERENCES Forms(UniqueId)
);
GO

create PROCEDURE CreateForm
    @Name NVARCHAR(100),
    @CreatedAt DATETIME2,
    @UpdatedAt DATETIME2,
    @UniqueId NVARCHAR(10),
    @ParentFormId INT = NULL,
    @FormId INT OUTPUT
AS
BEGIN
    IF @ParentFormId IS NULL
    BEGIN
        INSERT INTO Forms (Name, CreatedAt, UpdatedAt, UniqueId)
        VALUES (@Name, @CreatedAt, @UpdatedAt, @UniqueId);
        
        SET @FormId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        INSERT INTO NestedForms (ParentFormId, Name, CreatedAt, UpdatedAt, UniqueId)
        VALUES (@ParentFormId, @Name, @CreatedAt, @UpdatedAt, @UniqueId);
        
        SET @FormId = SCOPE_IDENTITY();
    END
END
GO


-- obtener form mediante id unico
create PROCEDURE GetFormByUniqueId
    @UniqueId NVARCHAR(10)
AS
BEGIN
    -- principal
    SELECT F.Id, F.Name, F.CreatedAt, F.UpdatedAt, F.UniqueId
    FROM Forms F
    WHERE F.UniqueId = @UniqueId;

    -- campos de principal
    SELECT FF.Id, FF.FormUniqueId, FF.Type, FF.Label, FF.Name, FF.Required, FF.[Order], FF.OptionsJson, FF.NestedFormId
    FROM FormFields FF
    WHERE FF.FormUniqueId = @UniqueId
    ORDER BY FF.[Order];

    -- formularios anidados
    SELECT NF.Id, NF.ParentFormId, NF.Name, NF.CreatedAt, NF.UpdatedAt, NF.UniqueId
    FROM NestedForms NF
    INNER JOIN Forms F ON NF.ParentFormId = F.Id
    WHERE F.UniqueId = @UniqueId;

    -- campos de formularios anidados
    SELECT FF.Id, FF.FormUniqueId, FF.Type, FF.Label, FF.Name, FF.Required, FF.[Order], FF.OptionsJson, FF.NestedFormId
    FROM FormFields FF
    WHERE FF.FormUniqueId IN (SELECT UniqueId FROM NestedForms WHERE ParentFormId = (SELECT Id FROM Forms WHERE UniqueId = @UniqueId))
    ORDER BY FF.[Order];
END
GO



-- agregar un campo a un form
create PROCEDURE AddFormField
    @FormId INT,
    @FormUniqueId NVARCHAR(10),
    @Type NVARCHAR(50),
    @Label NVARCHAR(100),
    @Name NVARCHAR(100),
    @Required BIT,
    @Order INT,
    @OptionsJson NVARCHAR(MAX),
    @NestedFormId INT = NULL
AS
BEGIN
    INSERT INTO FormFields (FormId, FormUniqueId, Type, Label, Name, Required, [Order], OptionsJson, NestedFormId)
    VALUES (@FormId, @FormUniqueId, @Type, @Label, @Name, @Required, @Order, @OptionsJson, @NestedFormId);
END
GO

-- obtener un form por id
CREATE PROCEDURE GetFormById
    @FormId INT
AS
BEGIN
    SELECT F.Id, F.Name, F.CreatedAt, F.UpdatedAt
    FROM Forms F
    WHERE F.Id = @FormId;

    SELECT FF.Id, FF.FormId, FF.Type, FF.Label, FF.Name, FF.Required, FF.[Order], FF.OptionsJson
    FROM FormFields FF
    WHERE FF.FormId = @FormId
    ORDER BY FF.[Order];
END
GO

-- stored procedures para ingresar datos a partir de plantilla de formulario
create PROCEDURE SubmitForm
    @FormUniqueId NVARCHAR(10),
    @SubmissionData NVARCHAR(MAX),
    @SubmittedAt DATETIME2,
    @SubmissionId INT OUTPUT
AS
BEGIN
    INSERT INTO FormSubmissions (FormUniqueId, SubmissionData, SubmittedAt)
    VALUES (@FormUniqueId, @SubmissionData, @SubmittedAt);
    
    SET @SubmissionId = SCOPE_IDENTITY();
END
GO

-- stored procedure para conseguir los datos ingresados a partir de plantilla form
create PROCEDURE GetFormSubmissions
    @FormUniqueId NVARCHAR(10)
AS
BEGIN
    SELECT Id, FormUniqueId, SubmissionData, SubmittedAt
    FROM FormSubmissions
    WHERE FormUniqueId = @FormUniqueId
    ORDER BY SubmittedAt DESC;
END
GO

CREATE PROCEDURE GetAllForms
AS
BEGIN
    -- Obtener todos los form principales
    SELECT F.Id, F.Name, F.CreatedAt, F.UpdatedAt, F.UniqueId
    FROM Forms F;

    -- Obtener todos los campos de form principal
    SELECT FF.Id, FF.FormUniqueId, FF.Type, FF.Label, FF.Name, FF.Required, FF.[Order], FF.OptionsJson, FF.NestedFormId
    FROM FormFields FF
    WHERE FF.NestedFormId IS NULL
    ORDER BY FF.[Order];

    -- obtener todos los forms anidados
    SELECT NF.Id, NF.ParentFormId, NF.Name, NF.CreatedAt, NF.UpdatedAt, NF.UniqueId
    FROM NestedForms NF;

    -- obtener todos los campos de los forms anidados
    SELECT FF.Id, FF.FormUniqueId, FF.Type, FF.Label, FF.Name, FF.Required, FF.[Order], FF.OptionsJson, FF.NestedFormId
    FROM FormFields FF
    WHERE FF.NestedFormId IS NOT NULL
    ORDER BY FF.[Order];
END
GO

-- borrar usando id unico
create PROCEDURE DeleteFormByUniqueId
    @UniqueId NVARCHAR(10)
AS
BEGIN
    DECLARE @FormId INT;
    SELECT @FormId = Id FROM Forms WHERE UniqueId = @UniqueId;

    IF @FormId IS NOT NULL
    BEGIN
        -- borrar campos asociados a anidado
        DELETE FROM FormFields
        WHERE NestedFormId IN (SELECT Id FROM NestedForms WHERE ParentFormId = @FormId);

        -- borrar formularios anidados
        DELETE FROM NestedForms
        WHERE ParentFormId = @FormId;

        -- borrar campos asociados a form principal
        DELETE FROM FormFields
        WHERE FormId = @FormId;

        -- borrar ingresos asociados a form principal
        DELETE FROM FormSubmissions
        WHERE FormUniqueId = @UniqueId;

        -- borrar form principal
        DELETE FROM Forms
        WHERE Id = @FormId;
    END
END
GO
