using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace DatingApp.API.Dtos
{
    public class UserWithPhotosForModerationDto
    {
        public int IdUser { get; set; }
        public string KnownAs { get; set; }
        public IEnumerable<PhotoForReturnDto> PhotosForModeration { get; set; }
    }
}