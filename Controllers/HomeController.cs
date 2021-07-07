using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace Chat_Messenger.Controllers
{
    public class HomeController : Controller
    {
        public List<object> messageBox = new List<object>();

        private ApplicationUserManager _userManager;

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        public ActionResult HomePage()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

        [HttpPost]
        public JsonResult sendMessage(messageBody message)
        {
            dynamic response = new ExpandoObject();
            messageBox.Add(message);
            response.messageBox = messageBox;
            return Json(response);
        }

        [HttpPost]
        public JsonResult startNewChat(string userName)
        {
            dynamic response = new ExpandoObject();
            try
            {
                var user = AccountController.RegisteredUsers.Find(x => x.userName == userName);
                //IdentityUser user = await UserManager.FindByNameAsync(userName);

                if (user == null)
                {
                    response.error_description = "Incorrect Username";
                    response.message = $"No User found with the User Name {userName}!";
                    return Json(response);
                }
                else
                {
                    //response.userId = user.userId;
                    response.userName = user.userName;
                    return Json(response);
                }
            }
            catch (Exception ex)
            {
                response.error_description = ex.Message;
                response.message = $"No User found with the User Name {userName}!";
                return Json(response);
                throw;
            }
        }
    }

    public struct messageBody {
        public string accessToken { get; set; }
        public string messageString { get; set; }
    }
}
