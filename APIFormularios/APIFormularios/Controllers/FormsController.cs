using System.Text.Json;
using APIFormularios.Models;
using APIFormularios.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIFormularios.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormsController : ControllerBase
{
    private readonly IFormRepository _formRepository;

    public FormsController(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<Form>>> GetAllForms()
    {
        var forms = await _formRepository.GetAllFormsAsync();
        return Ok(forms);
    }


    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateForm([FromBody] FormCreationModel formModel)
    {
        //
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // crear form a partir de modelo
        var form = new Form
        {
            Name = formModel.Name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            UniqueId = GenerateUniqueId(),
            Fields = formModel.Fields.Select((f, index) => new FormField
            {
                Type = f.Type,
                Label = f.Label,
                Name = f.Name,
                Required = f.Required,
                Order = index,
                OptionsJson = JsonSerializer.Serialize(f.Options)
            }).ToList(),
            NestedForms = formModel.NestedForms.Select(nf => new NestedForm
            {
                Name = nf.Name,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UniqueId = GenerateUniqueId(),
                Fields = nf.Fields.Select((f, index) => new FormField
                {
                    Type = f.Type,
                    Label = f.Label,
                    Name = f.Name,
                    Required = f.Required,
                    Order = index,
                    OptionsJson = JsonSerializer.Serialize(f.Options)
                }).ToList()
            }).ToList()
        };

        int formId = await _formRepository.CreateFormAsync(form);

        return CreatedAtAction(nameof(GetFormByUniqueId), new { uniqueId = form.UniqueId }, form);
    }

    [HttpGet("{uniqueId}")]
    public async Task<ActionResult<Form>> GetFormByUniqueId(string uniqueId)
    {
        // obtencion de form mediante id unico
        var form = await _formRepository.GetFormByUniqueIdAsync(uniqueId);

        if (form == null)
        {
            return NotFound();
        }

        return form;
    }

    // funcion utilitaria para generar un id pseudo aleatorio perro que igualmente ayuda
    private string GenerateUniqueId()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 16)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    // ingresar datos de form a partir de plantilla form
    [HttpPost("{uniqueId}/submit")]
    public async Task<IActionResult> SubmitForm(string uniqueId, [FromBody] Dictionary<string, object> formData)
    {
        var submission = new FormSubmission
        {
            FormUniqueId = uniqueId,
            SubmissionData = JsonSerializer.Serialize(formData),
            SubmittedAt = DateTime.UtcNow
        };

        var submissionId = await _formRepository.SubmitFormAsync(submission);
        return Ok(new { SubmissionId = submissionId });
    }

    [HttpGet("{uniqueId}/submissions")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<FormSubmission>>> GetFormSubmissions(string uniqueId)
    {
        var submissions = await _formRepository.GetFormSubmissionsAsync(uniqueId);
        return Ok(submissions);
    }

    [HttpGet("{uniqueId}/submissions/{submissionId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<FormSubmission>> GetFormSubmission(string uniqueId, int submissionId)
    {
        var submissions = await _formRepository.GetFormSubmissionsAsync(uniqueId);
        var submission = submissions.FirstOrDefault(s => s.Id == submissionId);

        if (submission == null)
        {
            return NotFound();
        }

        return Ok(submission);
    }

    //erificar
    [HttpDelete("{uniqueId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFormByUniqueId(string uniqueId)
    {
        var form = await _formRepository.GetFormByUniqueIdAsync(uniqueId);
        if (form == null)
        {
            return NotFound();
        }

        var result = await _formRepository.DeleteFormByUniqueIdAsync(uniqueId);
        if (!result)
        {
            return StatusCode(500, "ha ocurrido un problema realizando la consulta");
        }

        return NoContent();
    }
}