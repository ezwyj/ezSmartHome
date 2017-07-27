using PetaPoco;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace WebService.Controllers
{
    public class HomeController : Controller
    {
        private string GetJsonString()
        {
            string postStr = string.Empty;
            Stream inputStream = Request.InputStream;
            int contentLength = Request.ContentLength;
            int offset = 0;
            if (contentLength > 0)
            {
                byte[] buffer = new byte[contentLength];
                for (int i = inputStream.Read(buffer, offset, contentLength - offset); i > 0; i = inputStream.Read(buffer, offset, contentLength - offset))
                {
                    offset += i;
                }
                UTF8Encoding encoding = new UTF8Encoding();
                postStr = encoding.GetString(buffer);
            }
            return postStr;
        }
        static FileLog runLog = new FileLog(AppDomain.CurrentDomain.BaseDirectory + @"/log/runLog.txt");
        [HttpPost]
        public JsonResult Post( )
        {
            runLog.log(GetJsonString());
             
            
            
            
            //var obj  = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongRequest>(json);
            //DingDongResponse r = new DingDongResponse();
            return new JsonResult { Data = "OK"  };
        }

        public ActionResult UserProfile(string state)
        {
            state = state.Replace(" ", "+");
            var json = Decrypt(state, _key);
            var entity = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongOpenRequest>(json);

            return View();
        }
        public ActionResult Success()
        {

            return View();
        }
        

        [HttpPost]
        public ActionResult UserProfile(FormCollection collection)
        {
   
            
            return View();
        }
        private static byte[] _key = Convert.FromBase64String(@"uw4FGrtauRGbh2ukh2ZFAA ==");
        private static string Decrypt(string toDecrypt, byte[] key)
        {
            byte[] keyArray = key;
            byte[] inputBuffer = Convert.FromBase64String(toDecrypt);
            RijndaelManaged rDel = new RijndaelManaged();
            rDel.Key = keyArray;
            rDel.Mode = CipherMode.ECB;
            rDel.Padding = PaddingMode.PKCS7;
            ICryptoTransform cTransform = rDel.CreateDecryptor();

            byte[] resultArray = cTransform.TransformFinalBlock(inputBuffer, 0, inputBuffer.Length);

            return Encoding.UTF8.GetString(resultArray);
        }
        public ContentResult OpenService(string state)
        {
            state = state.Replace(" ", "+");
            var json = Decrypt(state, _key);
            var entity = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongOpenRequest>(json);
            Database db = new Database("Db");
            db.BeginTransaction();
            string sqlCheck = string.Format("Select count(0) from DingDongCall_User where DingDongUserId='{0}'", entity.userid);
            var first = db.ExecuteScalar<int>(sqlCheck);
            string sqlUserToDo = string.Empty;
            if (first == 0)
            {
                //新增
                sqlUserToDo = string.Format("Insert into DingDongCall_User (DingDongUserId,Inputtime,status) values ('{0}',getdate(),'{1}')", entity.userid, entity.operation);
            }
            else
            {
                sqlUserToDo = string.Format("Update DingDongCall_User set status='{0}',InputTime=getdate() where DingDongUserId='{1}'", entity.operation, entity.userid);
            }
            try
            {

                db.Execute(sqlUserToDo);
                db.CompleteTransaction();
                return Content("0");
            }
            catch (Exception e)
            {
                db.AbortTransaction();
                return Content("1");
            }
        }
    }
}