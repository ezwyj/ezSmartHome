using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebService.Controllers
{
    public class HomeController : Controller
    {
        static FileLog runLog = new FileLog(AppDomain.CurrentDomain.BaseDirectory + @"/log/runLog.txt");
        [HttpPost]
        public JsonResult Post( )
        {

            string json = Request.InputStream.ToString();
            runLog.log(json);
            var obj  = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongRequest>(json);
            DingDongResponse r = new DingDongResponse();
            return new JsonResult { Data = r  };
        }
    }
}