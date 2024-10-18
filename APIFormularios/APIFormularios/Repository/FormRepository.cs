using System.Data;
using APIFormularios.Models;
using Microsoft.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;

namespace APIFormularios.Repository;

public class FormRepository : IFormRepository
{
    private readonly string _connectionString;

    public FormRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
                            ?? throw new ArgumentNullException(nameof(configuration), "Connection string cannot be null");
    }

    public async Task<IEnumerable<Form>> GetAllFormsAsync()
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            using (var multi = await connection.QueryMultipleAsync("GetAllForms", commandType: CommandType.StoredProcedure))
            {
                var forms = (await multi.ReadAsync<Form>()).ToList();
                var fields = (await multi.ReadAsync<FormField>()).ToList();
                var nestedForms = (await multi.ReadAsync<NestedForm>()).ToList();
                var nestedFormFields = (await multi.ReadAsync<FormField>()).ToList();

                // asigna los campos a form principal
                foreach (var form in forms)
                {
                    form.Fields = fields.Where(f => f.FormUniqueId == form.UniqueId).ToList();
                    form.NestedForms = nestedForms.Where(nf => nf.ParentFormId == form.Id).ToList();

                    // ahora asigna a anidados
                    foreach (var nestedForm in form.NestedForms)
                    {
                        nestedForm.Fields = nestedFormFields.Where(f => f.FormUniqueId == nestedForm.UniqueId).ToList();
                    }
                }

                return forms;
            }
        }
    }


    public async Task<int> CreateFormAsync(Form form)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            var parameters = new DynamicParameters();
            parameters.Add("@Name", form.Name);
            parameters.Add("@CreatedAt", form.CreatedAt);
            parameters.Add("@UpdatedAt", form.UpdatedAt);
            parameters.Add("@UniqueId", form.UniqueId);
            parameters.Add("@FormId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync("CreateForm", parameters, commandType: CommandType.StoredProcedure);

            int formId = parameters.Get<int>("@FormId");

            foreach (var field in form.Fields)
            {
                await connection.ExecuteAsync("AddFormField", new
                {
                    FormId = formId,
                    FormUniqueId = form.UniqueId,
                    field.Type,
                    field.Label,
                    field.Name,
                    field.Required,
                    field.Order,
                    OptionsJson = field.OptionsJson,
                    NestedFormId = (int?)null
                }, commandType: CommandType.StoredProcedure);
            }

            foreach (var nestedForm in form.NestedForms)
            {
                var nestedFormParameters = new DynamicParameters();
                nestedFormParameters.Add("@Name", nestedForm.Name);
                nestedFormParameters.Add("@CreatedAt", nestedForm.CreatedAt);
                nestedFormParameters.Add("@UpdatedAt", nestedForm.UpdatedAt);
                nestedFormParameters.Add("@UniqueId", nestedForm.UniqueId);
                nestedFormParameters.Add("@ParentFormId", formId);
                nestedFormParameters.Add("@FormId", dbType: DbType.Int32, direction: ParameterDirection.Output);

                await connection.ExecuteAsync("CreateForm", nestedFormParameters, commandType: CommandType.StoredProcedure);

                int nestedFormId = nestedFormParameters.Get<int>("@FormId");

                foreach (var field in nestedForm.Fields)
                {
                    await connection.ExecuteAsync("AddFormField", new
                    {
                        FormId = formId,
                        FormUniqueId = nestedForm.UniqueId,
                        field.Type,
                        field.Label,
                        field.Name,
                        field.Required,
                        field.Order,
                        OptionsJson = field.OptionsJson,
                        NestedFormId = nestedFormId
                    }, commandType: CommandType.StoredProcedure);
                }
            }

            return formId;
        }
    }


    public async Task<Form> GetFormByIdAsync(int id)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            using (var multi = await connection.QueryMultipleAsync("GetFormById", new { FormId = id }, commandType: CommandType.StoredProcedure))
            {
                var form = await multi.ReadSingleOrDefaultAsync<Form>();
                if (form != null)
                {
                    form.Fields = (await multi.ReadAsync<FormField>()).AsList();
                }
                return form;
            }
        }
    }

    public async Task<Form> GetFormByUniqueIdAsync(string uniqueId)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            using (var multi = await connection.QueryMultipleAsync("GetFormByUniqueId", new { UniqueId = uniqueId }, commandType: CommandType.StoredProcedure))
            {
                var form = await multi.ReadSingleOrDefaultAsync<Form>();
                if (form != null)
                {
                    var fields = (await multi.ReadAsync<FormField>()).AsList();
                    var nestedForms = (await multi.ReadAsync<NestedForm>()).AsList();
                    var nestedFormFields = (await multi.ReadAsync<FormField>()).AsList();

                    // asigna los campos al form principal
                    form.Fields = fields.Where(f => f.NestedFormId == null && f.FormUniqueId == form.UniqueId).ToList();

                    // asigna los campos a forms anidados
                    foreach (var nestedForm in nestedForms)
                    {
                        nestedForm.Fields = nestedFormFields.Where(f => f.FormUniqueId == nestedForm.UniqueId).ToList();
                    }

                    form.NestedForms = nestedForms;
                }
                return form;
            }
        }
    }



    public async Task<int> SubmitFormAsync(FormSubmission submission)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            var parameters = new DynamicParameters();
            // establecer params de sps
            parameters.Add("@FormUniqueId", submission.FormUniqueId);
            parameters.Add("@SubmissionData", submission.SubmissionData);
            parameters.Add("@SubmittedAt", submission.SubmittedAt);
            parameters.Add("@SubmissionId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            try
            {
                await connection.ExecuteAsync("SubmitForm", parameters, commandType: CommandType.StoredProcedure);
                return parameters.Get<int>("@SubmissionId");
            }
            catch (SqlException ex)
            {
                // Log crudo de errores, no usar en prod
                Console.WriteLine($"SQL Error: {ex.Message}");
                throw;
            }
        }
    }

    public async Task<IEnumerable<FormSubmission>> GetFormSubmissionsAsync(string uniqueId)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            return await connection.QueryAsync<FormSubmission>(
                "GetFormSubmissions",
                new { FormUniqueId = uniqueId },
                commandType: CommandType.StoredProcedure
            );
        }
    }

    // TODO pendiente revisar trace del stored procedure
    public async Task<bool> DeleteFormByUniqueIdAsync(string uniqueId)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();
            var affectedRows = await connection.ExecuteAsync("DeleteFormByUniqueId", new { UniqueId = uniqueId }, commandType: CommandType.StoredProcedure);
            return affectedRows > 0;
        }
    }

}

// mantener la interfaz para la inyeccion de dependencias en capa repositorio
public interface IFormRepository
{
    Task<IEnumerable<Form>> GetAllFormsAsync();
    Task<int> CreateFormAsync(Form form);
    Task<Form> GetFormByIdAsync(int id);
    Task<int> SubmitFormAsync(FormSubmission submission);
    Task<Form> GetFormByUniqueIdAsync(string uniqueId);
    Task<IEnumerable<FormSubmission>> GetFormSubmissionsAsync(string uniqueId);
    Task<bool> DeleteFormByUniqueIdAsync(string uniqueId);
}
