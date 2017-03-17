using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
            var req = Newtonsoft.Json.JsonConvert.DeserializeObject<StateEntity>(state);

            return View();
        }
        public ActionResult Success()
        {

            return View();
        }
        public static string AESDecrypt(String Data, String Key)
        {
            Byte[] encryptedBytes = Convert.FromBase64String(Data);
            Byte[] bKey = new Byte[32];
            Array.Copy(Encoding.UTF8.GetBytes(Key.PadRight(bKey.Length)), bKey, bKey.Length);

            MemoryStream mStream = new MemoryStream(encryptedBytes);
            //mStream.Write( encryptedBytes, 0, encryptedBytes.Length );  
            //mStream.Seek( 0, SeekOrigin.Begin );  
            RijndaelManaged aes = new RijndaelManaged();
            aes.Mode = CipherMode.ECB;
            aes.Padding = PaddingMode.PKCS7;
            aes.KeySize = 128;
            aes.Key = bKey;
            //aes.IV = _iV;  
            CryptoStream cryptoStream = new CryptoStream(mStream, aes.CreateDecryptor(), CryptoStreamMode.Read);
            try
            {
                byte[] tmp = new byte[encryptedBytes.Length + 32];
                int len = cryptoStream.Read(tmp, 0, encryptedBytes.Length + 32);
                byte[] ret = new byte[len];
                Array.Copy(tmp, 0, ret, 0, len);
                return Encoding.UTF8.GetString(ret);
            }
            finally
            {
                cryptoStream.Close();
                mStream.Close();
                aes.Clear();
            }
        }

        [HttpPost]
        public ActionResult UserProfile(FormCollection collection)
        {
            return View();
        }

        public ActionResult OpenService(string state)
        {

            //Base64.encode(Aes.encrypt(AesKey,{ "userid":"用户标识","operation":"open/close","timestamp":"时间戳，毫秒","appid":"应用的APPID"}))
            byte[] bytes = Convert.FromBase64String(state);
            string unSec = Encoding.UTF8.GetString(bytes);


            var req = Newtonsoft.Json.JsonConvert.DeserializeObject<StateEntity>(state);
            runLog.log("open :"+state);
        
            if (req.operation == "open")
            {

            }
            else
            {

            }
            return Content("0");
        }
    }
}