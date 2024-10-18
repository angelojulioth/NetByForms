using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace APIFormularios.Models;

public class FormSubmission
{
    public int Id { get; set; }
    public string FormUniqueId { get; set; }
    public string SubmissionData { get; set; }
    public DateTime SubmittedAt { get; set; }
}

public class Form
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UniqueId { get; set; }
    public List<FormField> Fields { get; set; }
    public List<NestedForm> NestedForms { get; set; } // verificar func - propiedad de forms anidados
}

public class NestedForm
{
    public int Id { get; set; }
    public int ParentFormId { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UniqueId { get; set; }
    public List<FormField> Fields { get; set; }
}

public class FormField
{
    [Key]
    public int Id { get; set; }
    public string FormUniqueId { get; set; } // 
    public int? NestedFormId { get; set; }
    public string Type { get; set; }
    public string Label { get; set; }
    public string Name { get; set; }
    public bool Required { get; set; }
    public int Order { get; set; }
    [Column(TypeName = "nvarchar(max)")]
    public string OptionsJson { get; set; }
    [NotMapped]
    public List<string> Options
    {
        get => string.IsNullOrEmpty(OptionsJson) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(OptionsJson);
        set => OptionsJson = JsonSerializer.Serialize(value);
    }
    public virtual Form Form { get; set; }
    public virtual NestedForm NestedForm { get; set; }
}