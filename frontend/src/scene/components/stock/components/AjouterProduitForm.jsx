import React, { useState } from 'react';
import { Upload, Button, Tooltip, Input, Switch, Divider, Col } from 'antd';
import ImgCrop from 'antd-img-crop';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { MdCategory, MdOutlineProductionQuantityLimits, MdAutoDelete } from "react-icons/md";
import { AiFillPicture } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";

const AjouterProduitForm = ({ theme }) => {
  const [fileList, setFileList] = useState([]);
  const [imageData, setImageData] = useState(null);
  const [isVariant, setIsVariant] = useState(false);
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("");
  const [quantite, setQuantite] = useState("");
  const [quantiteVariante, setQuantiteVariante] = useState("");
  const [nomVariante, setNomVariante] = useState("");
  const [variants, setVariants] = useState([]);

  const darkStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    borderColor: 'gray',
  };

  const handleImage = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0];
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => {
        setImageData(reader.result);
      };
    } else {
      setImageData(null);
    }
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handleSwitchChange = (checked) => {
    setIsVariant(checked);
    console.log(`variante = ${checked}`);
  };

  const addVariant = (e) => {
    e.preventDefault();
    if (nomVariante && quantiteVariante) {
      setVariants([...variants, { nomVariante, quantiteVariante }]);
      setNomVariante("");
      setQuantiteVariante("");
    }
  };

  const deleteVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", {
      imageData,
      nom,
      categorie,
      quantite,
      isVariant,
      variants,
    });
  };

  return (
    <div className='produit-forms'>
      <form className='form-image' onSubmit={(e) => e.preventDefault()}>
        <ImgCrop rotationSlider>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleImage}
            onPreview={onPreview}
            maxCount={1} // Allow only one image to be uploaded
          >
            {fileList.length < 1 && '+ Upload'}
          </Upload>
        </ImgCrop>
        <Button type="primary" className='btn-dashboard' htmlType="submit">
            <AiFillPicture style={{marginRight:"8px"}}/>
            Ajouter Image
        </Button>
      </form>

      <form className='form-produit' onSubmit={handleSubmitProduct}>
        <div 
          className="colis-form-input"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Switch size="small" onChange={handleSwitchChange} style={{ width: "30px" }} />
          <span style={{ marginLeft: '8px' }}>Variantes</span>
        </div>
        <Divider />

        <div className="colis-form-input">
          <label htmlFor="nom">Nom <span className="etoile">*</span></label>
          <Input
            placeholder="Nom"
            size="large"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            style={theme === 'dark' ? darkStyle : {}}
            prefix={
              <UserOutlined
                style={{
                  color: 'rgba(0,0,0,.25)',
                }}
              />
            }
            suffix={
              <Tooltip title="Entrer nom de produit">
                <InfoCircleOutlined
                  style={{
                    color: 'rgba(0,0,0,.45)',
                  }}
                />
              </Tooltip>
            }
          />
        </div>

        <div className="colis-form-input">
          <label htmlFor="categorie">Categorie</label>
          <Input
            placeholder="Categorie"
            size="large"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            style={theme === 'dark' ? darkStyle : {}}
            prefix={
              <MdCategory
                style={{
                  color: 'rgba(0,0,0,.25)',
                }}
              />
            }
            suffix={
              <Tooltip title="Entrer categorie de produit">
                <InfoCircleOutlined
                  style={{
                    color: 'rgba(0,0,0,.45)',
                  }}
                />
              </Tooltip>
            }
          />
        </div>

        {!isVariant && (
          <div className="colis-form-input">
            <label htmlFor="quantite">Quantite <span className="etoile">*</span></label>
            <Input
              placeholder="Quantite"
              size="large"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              style={theme === 'dark' ? darkStyle : {}}
              prefix={
                <MdOutlineProductionQuantityLimits
                  style={{
                    color: 'rgba(0,0,0,.25)',
                  }}
                />
              }
              suffix={
                <Tooltip title="Entrer quantité de produit">
                  <InfoCircleOutlined
                    style={{
                      color: 'rgba(0,0,0,.45)',
                    }}
                  />
                </Tooltip>
              }
            />
          </div>
        )}

        {isVariant && (
          <div className="">
            <div className="variante-inputs">
                <div className="colis-form-input">
                <label htmlFor="nom_variante">Nom de variante <span className="etoile">*</span></label>
                <Input
                    placeholder="Nom de Variante"
                    size="large"
                    value={nomVariante}
                    onChange={(e) => setNomVariante(e.target.value)}
                    style={theme === 'dark' ? darkStyle : {}}
                    prefix={
                    <MdOutlineProductionQuantityLimits
                        style={{
                        color: 'rgba(0,0,0,.25)',
                        }}
                    />
                    }
                    suffix={
                    <Tooltip title="Entrer nom de variante de produit">
                        <InfoCircleOutlined
                        style={{
                            color: 'rgba(0,0,0,.45)',
                        }}
                        />
                    </Tooltip>
                    }
                />
                </div>
                <div className="colis-form-input">
                <label htmlFor="quantite_variante">Quantité <span className="etoile">*</span></label>
                <Input
                    placeholder="Quantite de Variante"
                    size="large"
                    value={quantiteVariante}
                    onChange={(e) => setQuantiteVariante(e.target.value)}
                    style={theme === 'dark' ? darkStyle : {}}
                    prefix={
                    <MdOutlineProductionQuantityLimits
                        style={{
                        color: 'rgba(0,0,0,.25)',
                        }}
                    />
                    }
                    suffix={
                    <Tooltip title="Entrer quantite de variante de produit">
                        <InfoCircleOutlined
                        style={{
                            color: 'rgba(0,0,0,.45)',
                        }}
                        />
                    </Tooltip>
                    }
                />
                </div>
                <button onClick={addVariant} className='btn-dashboard'>
                    Ajouter variante
                </button>
            </div>
            <div className="variante-list">
                <h2>Variantes List</h2>
                <Divider/>
                <ul>
                    {variants.map((variant, index) => (
                        <li key={index}>
                            <p>{variant.nomVariante}</p>
                            <p>{variant.quantiteVariante}</p>
                            <button onClick={() => deleteVariant(index)} type="button">
                                <MdAutoDelete/>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        )}
        <Button type="primary" htmlType="submit" className='btn-dashboard' style={{marginTop:'16px'}}>
            <FaPlus style={{marginRight:"8px"}}/>
            Ajouter Produit
        </Button>
      </form>
    </div>
  );
};

export default AjouterProduitForm;
