namespace APIFormularios.Models;

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class FormCreationModel
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; }

    [Required]
    [MinLength(1)]
    public List<FormFieldModel> Fields { get; set; }

    public List<NestedFormCreationModel> NestedForms { get; set; } // propiedad nueva agregada
}

public class NestedFormCreationModel
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; }

    [Required]
    [MinLength(1)]
    public List<FormFieldModel> Fields { get; set; }
}

public class FormFieldModel
{
    [Required]
    [StringLength(50)]
    public string Type { get; set; }

    [Required]
    [StringLength(100)]
    public string Label { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    public bool Required { get; set; }

    public List<string> Options { get; set; }
}