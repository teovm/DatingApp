using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using DatingApp.API.Dtos;
using Microsoft.AspNetCore.Identity;
using DatingApp.API.Models;
using System.Collections.Generic;
using AutoMapper;
using DatingApp.API.Helpers;
using System;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using CloudinaryDotNet;

namespace DatingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly UserManager<User> _userManager;
        public IMapper _mapper { get; }
        public IDatingRepository _repo { get; }
        public IOptions<CloudinarySettings> _cloudinaryConfig { get; }
        private Cloudinary _cloudinary;


        public AdminController(IDatingRepository repo,
                               DataContext context,
                               UserManager<User> userManager,
                               IMapper mapper,
                               IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _repo = repo;
            _mapper = mapper;
            _userManager = userManager;
            _context = context;
            _cloudinaryConfig = cloudinaryConfig;

            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("usersWithRoles")]
        public async Task<IActionResult> GetUsersWithRoles()
        {
            var userList = await _context.Users
                .OrderBy(x => x.UserName)
                .Select(user => new
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Roles = (from userRole in user.UserRoles
                             join role in _context.Roles on userRole.RoleId equals role.Id
                             select role.Name).ToList()
                }).ToListAsync();

            return Ok(userList);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("editRoles/{userName}")]
        public async Task<IActionResult> EditRoles(string userName, RoleEditDto roleEditDto)
        {
            var user = await _userManager.FindByNameAsync(userName);

            var userRoles = await _userManager.GetRolesAsync(user);

            var selectedRoles = roleEditDto.roleNames;
            selectedRoles = selectedRoles ?? new string[] { };

            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

            if (!result.Succeeded)
                return BadRequest("Failed to add to roles");

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if (!result.Succeeded)
                return BadRequest("Failed to remove the roles");

            return Ok(await _userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photosForModeration")]
        public async Task<IActionResult> GetPhotosForModeration()
        {
            var photosForModeration = await _repo.GetPhotosForModeration();
            var userWithPhotosForModeration = new List<UserWithPhotosForModerationDto>();

            foreach (var p in photosForModeration)
            {
                if (!userWithPhotosForModeration.Any(x => x.IdUser == p.UserId)) {
                    userWithPhotosForModeration.Add(new UserWithPhotosForModerationDto() {
                        IdUser = p.UserId,
                        KnownAs = p.User.KnownAs,
                        PhotosForModeration = 
                            _mapper.Map<IEnumerable<PhotoForReturnDto>>(photosForModeration.Where(x => x.UserId == p.UserId))
                    });
                }
            }

            return Ok(userWithPhotosForModeration);
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPut("ApprovePhoto/{id}")]
        public async Task<IActionResult> ApprovePhoto(int id)
        {
            var photoToApprove = await _repo.GetPhotoForApproval(id);
            photoToApprove.IsApproved = true;

            if (await _repo.SaveAll())
                return NoContent();

            throw new Exception($"Photo {id} approval failed on save");
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpDelete("RejectPhoto/{id}")]
        public async Task<IActionResult> RejectPhoto(int id) 
        {
            var photoToReject = await _repo.GetPhotoForApproval(id);

            if (photoToReject.PublicId != null)
            {
                var deleteParam = new DeletionParams(photoToReject.PublicId);

                var result = _cloudinary.Destroy(deleteParam);

                if (result.Result == "ok")
                    _repo.Delete(photoToReject);
            }
            else
            {
                _repo.Delete(photoToReject);
            }

            if (await _repo.SaveAll())
                return Ok();

            return BadRequest("Failed to reject the photo");
        }
    }
}